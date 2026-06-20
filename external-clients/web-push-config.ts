import { assert } from 'std/assert/assert.ts'
import { exportApplicationServerKey, exportVapidKeys, generateVapidKeys } from '@negrel/webpush'
import selfUrl from '../util/selfUrl.ts'

const LOCAL_VAPID_SUBJECT = 'mailto:dev@virtualhospitalsafrica.org'
const PRODUCTION_HOSTNAME = 'za.virtualhospitalsafrica.org'

export type VapidConfig = {
  public_key: string
  private_key: string
  subject: string
}

function readOptionalStringEnvironmentVariable(key: string): string | undefined {
  if (!Deno.env.has(key)) return undefined
  return Deno.env.get(key)
}

export function isProductionDeployment(): boolean {
  try {
    return new URL(selfUrl()).hostname === PRODUCTION_HOSTNAME
  } catch {
    return false
  }
}

export async function resolveVapidConfig({
  is_production,
  public_key,
  private_key,
  subject,
  generate_keys = generateVapidKeys,
}: {
  is_production: boolean
  public_key?: string
  private_key?: string
  subject?: string
  generate_keys?: typeof generateVapidKeys
}): Promise<VapidConfig> {
  const has_public_key = public_key !== undefined
  const has_private_key = private_key !== undefined

  assert(
    has_public_key === has_private_key,
    'VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must both be set or both be omitted',
  )

  if (public_key && private_key) {
    if (is_production) {
      assert(subject, 'VAPID_SUBJECT must be set in production')
      return { public_key, private_key, subject }
    }
    return {
      public_key,
      private_key,
      subject: subject ?? LOCAL_VAPID_SUBJECT,
    }
  }

  assert(
    !is_production,
    'VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set in production',
  )

  const keys = await generate_keys({ extractable: true })
  const exported = await exportVapidKeys(keys)
  assert(exported.privateKey.d)
  return {
    public_key: await exportApplicationServerKey(keys),
    private_key: exported.privateKey.d,
    subject: subject ?? LOCAL_VAPID_SUBJECT,
  }
}

const vapid_config = await resolveVapidConfig({
  is_production: isProductionDeployment(),
  public_key: readOptionalStringEnvironmentVariable('VAPID_PUBLIC_KEY'),
  private_key: readOptionalStringEnvironmentVariable('VAPID_PRIVATE_KEY'),
  subject: readOptionalStringEnvironmentVariable('VAPID_SUBJECT'),
})

export const vapid_public_key = vapid_config.public_key
export const vapid_private_key = vapid_config.private_key
export const vapid_subject = vapid_config.subject

export const vapid_server_config = {
  private_key: vapid_private_key,
  subject: vapid_subject,
}
