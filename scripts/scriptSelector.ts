import { Select } from 'prompt'
import * as path from 'std/path/mod.ts'

const scripts_dir = path.fromFileUrl(new URL('.', import.meta.url))

async function collectScripts(dir: string, base: string): Promise<string[]> {
  const results: string[] = []
  for await (const entry of Deno.readDir(dir)) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    const full = path.join(dir, entry.name)
    if (entry.isDirectory) {
      results.push(...await collectScripts(full, rel))
    } else if (entry.isFile && rel !== 'scriptSelector.ts') {
      results.push(rel)
    }
  }
  return results
}

const scripts = (await collectScripts(scripts_dir, '')).sort()

const selected = await Select.prompt({
  message: 'Select a script to run',
  options: scripts,
  search: true,
})

const full_path = path.join(scripts_dir, selected)

if (selected.endsWith('.ts')) {
  const proc = new Deno.Command('deno', {
    args: ['task', 'run:trusted', full_path],
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
  })
  const { code } = await proc.output()
  Deno.exit(code)
} else {
  const proc = new Deno.Command(full_path, {
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
  })
  const { code } = await proc.output()
  Deno.exit(code)
}
