import { attachTrx } from '../../backend/attachTrx.ts'
import { callNext } from '../../backend/timeMiddleware.ts'

export const handler = [
  callNext(attachTrx),
]
