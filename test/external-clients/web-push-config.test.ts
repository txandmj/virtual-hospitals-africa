import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import { resolveVapidConfig } from '../../external-clients/web-push-config.ts'

describe('external-clients/web-push-config.ts', () => {
  describe('resolveVapidConfig', () => {
    it('uses configured keys and subject in production', async () => {
      const config = await resolveVapidConfig({
        is_production: true,
        public_key: 'public-key',
        private_key: 'private-key',
        subject: 'mailto:ops@virtualhospitalsafrica.org',
      })

      assertEquals(config, {
        public_key: 'public-key',
        private_key: 'private-key',
        subject: 'mailto:ops@virtualhospitalsafrica.org',
      })
    })

    it('requires a subject in production when keys are configured', async () => {
      await assertRejects(
        () =>
          resolveVapidConfig({
            is_production: true,
            public_key: 'public-key',
            private_key: 'private-key',
          }),
        Error,
        'VAPID_SUBJECT must be set in production',
      )
    })

    it('allows a default development subject locally when keys are configured', async () => {
      const config = await resolveVapidConfig({
        is_production: false,
        public_key: 'public-key',
        private_key: 'private-key',
      })

      assertEquals(config.subject, 'mailto:dev@virtualhospitalsafrica.org')
    })

    it('generates keys locally when neither key is configured', async () => {
      const config = await resolveVapidConfig({
        is_production: false,
      })

      assertEquals(config.public_key.length > 0, true)
      assertEquals(config.private_key.length > 0, true)
      assertEquals(config.subject, 'mailto:dev@virtualhospitalsafrica.org')
    })

    it('rejects partial key configuration', async () => {
      await assertRejects(
        () =>
          resolveVapidConfig({
            is_production: false,
            public_key: 'public-key',
          }),
        Error,
        'VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must both be set or both be omitted',
      )
    })

    it('does not generate ephemeral keys in production', async () => {
      await assertRejects(
        () =>
          resolveVapidConfig({
            is_production: true,
            generate_keys: () => {
              throw new Error('should not generate keys in production')
            },
          }),
        Error,
        'VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set in production',
      )
    })
  })
})
