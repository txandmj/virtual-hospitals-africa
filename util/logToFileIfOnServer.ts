import { assert } from 'std/assert/assert.ts'
import { humanReadableJson } from './humanReadableJson.ts'
import generateUUID from './uuid.ts'

type LogOpts = {
  subdirectory?: string
  extension?: string
  filename?: string
}

// deno-lint-ignore no-explicit-any
export function logToFileIfOnServer(to_log: any, opts?: LogOpts) {
  const subdirectory = opts?.subdirectory || ''
  const filename = opts?.filename || generateUUID()
  const extension = opts?.extension || filename.includes('.') ? '' : '.json'
  if (globalThis.Deno) {
    if (subdirectory) assert(subdirectory.startsWith('/'))
    const file_name = `./logs${subdirectory}/${filename}${extension}`
    globalThis.Deno.writeTextFile(file_name, typeof to_log === 'string' ? to_log : humanReadableJson(to_log))
    console.log(`Logged to ${file_name}`)
  }
}
