import { assert } from 'node:console'
import { humanReadableJson } from './humanReadableJson.ts'
import generateUUID from './uuid.ts'

// deno-lint-ignore no-explicit-any
export function logJSONToFileIfOnServer(to_log: any, subdirectory?: string) {
  if (globalThis.Deno) {
    if (subdirectory) assert(subdirectory.startsWith('/'))
    const file_name = `./logs${subdirectory}/${generateUUID()}.json`
    globalThis.Deno.writeTextFileSync(file_name, humanReadableJson(to_log))
    console.log(`Logged to ${file_name}`)
  }
}
