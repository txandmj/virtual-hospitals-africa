import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describe('main.ts', () => {
  it('wires web push dispatcher startup exactly once', () => {
    const main_source = Deno.readTextFileSync(new URL('../main.ts', import.meta.url))
    const matches = main_source.match(/startWebPushDispatcherAtStartup\(\)/g) ?? []

    assertEquals(matches.length, 1)
  })
})
