import { readMandatoryStringEnvironmentVariable } from '../util/env.ts'

export const vapid_public_key = readMandatoryStringEnvironmentVariable(
  'VAPID_PUBLIC_KEY',
)

const vapid_private_key = readMandatoryStringEnvironmentVariable(
  'VAPID_PRIVATE_KEY',
)
const vapid_subject = readMandatoryStringEnvironmentVariable(
  'VAPID_SUBJECT',
)

export const vapid_server_config = {
  private_key: vapid_private_key,
  subject: vapid_subject,
}
