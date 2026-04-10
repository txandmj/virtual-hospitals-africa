/**
 * Post-build script to fix Fresh route ordering in `_fresh/server/server-entry.mjs`.
 *
 * Root cause: @fresh/core's `sortRoutePaths` has a bug where `charA < charB` returns
 * `0` instead of `-1`, making the comparator asymmetric. On Linux, `Deno.readDir`
 * returns files in hash order (not alphabetical), so the broken comparator produces
 * wrong results — e.g. `/app/_middleware` ends up after `/app/index`, causing auth
 * middleware to not run for `/app` routes.
 */

const SERVER_ENTRY = '_fresh/server/server-entry.mjs'

function getRoutePathScore(char: string, s: string, i: number): number {
  if (char === '_') {
    if (i + 1 < s.length) {
      if (s[i + 1] === 'e') return 4
      if (s[i + 1] === 'm') return 6
    }
    return 5
  } else if (char === '[') {
    if (i + 1 < s.length && s[i + 1] === '.') return 0
    return 1
  }
  if (i + 4 === s.length - 1 && char === 'i' && s[i + 1] === 'n' && s[i + 2] === 'd' && s[i + 3] === 'e' && s[i + 4] === 'x') {
    return 3
  }
  return 2
}

const APP_REG = /_app(?!\.[tj]sx?)?$/

function sortRoutePaths(a: string, b: string): number {
  if (APP_REG.test(a)) return -1
  else if (APP_REG.test(b)) return 1

  const aLen = a.length
  const bLen = b.length
  let segment = false
  let aIdx = 0
  let bIdx = 0

  for (; aIdx < aLen && bIdx < bLen; aIdx++, bIdx++) {
    const charA = a.charAt(aIdx)
    const charB = b.charAt(bIdx)

    if (charA === '(' && charB !== '(') {
      if (charB === '[') return -1
      return 1
    } else if (charB === '(' && charA !== '(') {
      if (charA === '[') return 1
      return -1
    }

    if (charA === '/' || charB === '/') {
      segment = true
      if (charA !== '/') return 1
      if (charB !== '/') return -1
      continue
    }

    if (segment) {
      segment = false
      const scoreA = getRoutePathScore(charA, a, aIdx)
      const scoreB = getRoutePathScore(charB, b, bIdx)
      if (scoreA === scoreB) {
        if (charA !== charB) {
          // Fixed: was `charA < charB ? 0 : 1` — the `0` should be `-1`
          return charA < charB ? -1 : 1
        }
        continue
      }
      return scoreA > scoreB ? -1 : 1
    }

    if (charA !== charB) {
      // Fixed: was `charA < charB ? 0 : 1` — the `0` should be `-1`
      return charA < charB ? -1 : 1
    }

    if (aIdx === aLen - 1 && bIdx < bLen - 1) return 1
    else if (bIdx === bLen - 1 && aIdx < aLen - 1) return -1
  }

  return 0
}

const content = await Deno.readTextFile(SERVER_ENTRY)

const MARKER = '\nconst fsRoutes = [\n'
const startIdx = content.indexOf(MARKER)
if (startIdx === -1) {
  console.log('fix_fresh_route_order: fsRoutes array not found, skipping')
  Deno.exit(0)
}

const arrayStart = startIdx + MARKER.length
const arrayEnd = content.indexOf('\n];\n', arrayStart)
if (arrayEnd === -1) {
  console.error('fix_fresh_route_order: could not find end of fsRoutes array')
  Deno.exit(1)
}

const routeLines = content.slice(arrayStart, arrayEnd).split('\n').filter((l) => l.trim().length > 0)

function getRouteId(line: string): string {
  const match = line.match(/\{ id: "([^"]+)"/)
  return match ? match[1] : ''
}

const originalIds = routeLines.map(getRouteId)
const sortedLines = [...routeLines].sort((a, b) => sortRoutePaths(getRouteId(a), getRouteId(b)))
const sortedIds = sortedLines.map(getRouteId)

const changed = originalIds.some((id, i) => id !== sortedIds[i])

if (!changed) {
  console.log('fix_fresh_route_order: route order already correct, no changes needed')
  Deno.exit(0)
}

console.log('fix_fresh_route_order: reordering routes to fix middleware ordering on Linux')

// Show what changed (first few diffs)
let diffCount = 0
for (let i = 0; i < originalIds.length && diffCount < 5; i++) {
  if (originalIds[i] !== sortedIds[i]) {
    console.log(`  [${i}] was: ${originalIds[i]}, now: ${sortedIds[i]}`)
    diffCount++
  }
}
if (diffCount === 5) console.log('  ...(more changes)')

const newContent = content.slice(0, startIdx) + MARKER + sortedLines.join('\n') + '\n' + content.slice(arrayEnd + 1)

await Deno.writeTextFile(SERVER_ENTRY, newContent)
console.log('fix_fresh_route_order: done')
