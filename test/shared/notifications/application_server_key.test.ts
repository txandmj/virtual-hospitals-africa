import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { applicationServerKeysMatch, urlBase64ToUint8Array } from '../../../shared/notifications/application_server_key.ts'

describe('shared/notifications/application_server_key.ts', () => {
  const vapid_public_key = 'BDsD5qRyJeBmU-d4X-KWcVBJkD68Efbw4k0xJWhE6ezfZA9aXLvd4mHK-eAYD8pA7FLhnXzfMDLhGLUZ4nHLen0'

  describe('applicationServerKeysMatch', () => {
    it('returns true when the subscription key bytes match the VAPID public key', () => {
      assertEquals(
        applicationServerKeysMatch(
          urlBase64ToUint8Array(vapid_public_key),
          vapid_public_key,
        ),
        true,
      )
    })

    it('returns false when the subscription key bytes differ', () => {
      const matching_bytes = [...urlBase64ToUint8Array(vapid_public_key)]
      const last_byte = matching_bytes.pop()
      assert(last_byte !== undefined)
      matching_bytes.push(last_byte + 1)
      const mismatched = Uint8Array.from(matching_bytes)

      assertEquals(
        applicationServerKeysMatch(mismatched, vapid_public_key),
        false,
      )
    })

    it('returns false when the subscription key is missing', () => {
      assertEquals(applicationServerKeysMatch(null, vapid_public_key), false)
      assertEquals(applicationServerKeysMatch(undefined, vapid_public_key), false)
    })
  })
})
