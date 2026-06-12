import { vapid_public_key } from '../../external-clients/web-push-config.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'
import { json } from '../../util/responses.ts'

export const handler = {
  GET(_ctx: LoggedInHealthWorkerContext) {
    return json({ public_key: vapid_public_key })
  },
}
