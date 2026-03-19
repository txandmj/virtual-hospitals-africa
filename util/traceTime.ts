import { __local_storage__ } from '../backend/local_storage.ts'
import generateUUID from './uuid.ts'

export async function traceTime<T>(message: string, callback: () => Promise<T>): Promise<T> {
  const store = __local_storage__.getStore()
  const key = store?.traceparent || generateUUID()
  console.log(`${key} ${message} start ${new Date()}`)
  console.time(`${key} ${message}`)
  const result = await callback()
  console.timeEnd(`${key} ${message}`)
  console.log(`${key} ${message} end ${new Date()}`)
  return result
}
