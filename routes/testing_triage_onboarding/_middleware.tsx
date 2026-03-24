import { RenderedHealthWorker } from '../../types.ts'
import { attachTrx, TrxContext } from '../../backend/attachTrx.ts'
import { timeMiddlewareCallNext } from '../../backend/timeMiddleware.ts'

export type TestingTriageOnboardingContext = TrxContext & {
  state: {
    session_id: string
    health_worker: RenderedHealthWorker
  }
}

export const handler = [
  timeMiddlewareCallNext(attachTrx),
]
