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

  const a_len = a.length
  const b_len = b.length
  let segment = false
  let a_idx = 0
  let b_idx = 0

  for (; a_idx < a_len && b_idx < b_len; a_idx++, b_idx++) {
    const char_a = a.charAt(a_idx)
    const char_b = b.charAt(b_idx)

    if (char_a === '(' && char_b !== '(') {
      if (char_b === '[') return -1
      return 1
    } else if (char_b === '(' && char_a !== '(') {
      if (char_a === '[') return 1
      return -1
    }

    if (char_a === '/' || char_b === '/') {
      segment = true
      if (char_a !== '/') return 1
      if (char_b !== '/') return -1
      continue
    }

    if (segment) {
      segment = false
      const score_a = getRoutePathScore(char_a, a, a_idx)
      const score_b = getRoutePathScore(char_b, b, b_idx)

      if (score_a === score_b) {
        if (char_a !== char_b) {
          // Fixed: was `charA < charB ? 0 : 1` — the `0` should be `-1`
          return char_a < char_b ? -1 : 1
        }
        continue
      }
      return score_a > score_b ? -1 : 1
    }

    if (char_a !== char_b) {
      // Fixed: was `charA < charB ? 0 : 1` — the `0` should be `-1`
      return char_a < char_b ? -1 : 1
    }

    if (a_idx === a_len - 1 && b_idx < b_len - 1) return 1
    else if (b_idx === b_len - 1 && a_idx < a_len - 1) return -1
  }

  return 0
}

const content = await Deno.readTextFile(SERVER_ENTRY)

const MARKER = '\nconst fs' + 'Routes = [\n'
const start_idx = content.indexOf(MARKER)
if (start_idx === -1) {
  console.log('fix_fresh_route_order: fsRoutes array not found, skipping')
  Deno.exit(0)
}

const array_start = start_idx + MARKER.length
const array_end = content.indexOf('\n];\n', array_start)
if (array_end === -1) {
  console.error('fix_fresh_route_order: could not find end of fsRoutes array')
  Deno.exit(1)
}

const route_lines = content.slice(array_start, array_end).split('\n').filter((l) => l.trim().length > 0)

function getRouteId(line: string): string {
  const match = line.match(/\{ id: "([^"]+)"/)
  return match ? match[1] : ''
}

const original_ids = route_lines.map(getRouteId)
const sorted_lines = [...route_lines].sort((a, b) => sortRoutePaths(getRouteId(a), getRouteId(b)))
const sorted_ids = sorted_lines.map(getRouteId)

const changed = original_ids.some((id, i) => id !== sorted_ids[i])

if (!changed) {
  console.log('fix_fresh_route_order: route order already correct, no changes needed')
  Deno.exit(0)
}

console.log('fix_fresh_route_order: reordering routes to fix middleware ordering on Linux')

// Show what changed (first few diffs)
let diff_count = 0
for (let i = 0; i < original_ids.length && diff_count < 5; i++) {
  if (original_ids[i] !== sorted_ids[i]) {
    console.log(`  [${i}] was: ${original_ids[i]}, now: ${sorted_ids[i]}`)
    diff_count++
  }
}
if (diff_count === 5) console.log('  ...(more changes)')

const new_content = content.slice(0, start_idx) + MARKER + sorted_lines.join('\n') + '\n' + content.slice(array_end + 1)

await Deno.writeTextFile(SERVER_ENTRY, new_content)
console.log('fix_fresh_route_order: done')
