import { notifications } from '../../db/models/notifications.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'
import upgradeWebsocket from '../../util/websocket.ts'
import last from '../../util/last.ts'

export default upgradeWebsocket((
  ctx: LoggedInHealthWorkerContext,
  socket: WebSocket,
) => {
  console.log('upgraded websocket')
  // deno-lint-ignore no-explicit-any
  let timeout: any
  let past_ts: Date | undefined

  async function loop() {
    console.log('notifications-websocket loop')
    notifications.verbose = true
    const new_notifications = await notifications.findAll(
      ctx.state.trx,
      {
        health_worker_id: ctx.state.health_worker.id,
        past_ts,
      },
    )
    for (const new_notification of new_notifications) {
      console.log('new_notification weklewkl', new_notification)
      if (!past_ts || (new_notification.created_at > past_ts)) {
        socket.send(JSON.stringify({
          ...new_notification,
          type: 'new_notification',
        }))
      }
      past_ts = new_notification.created_at
    }
    timeout = setTimeout(loop, 1000)
  }

  socket.onopen = async () => {
    const notifs = await notifications.findAll(
      ctx.state.trx,
      {
        health_worker_id: ctx.state.health_worker.id,
      },
    )
    past_ts = last(notifs)?.created_at
    await loop()
  }
  socket.onclose = () => clearTimeout(timeout)
  socket.onerror = (/* error */) => {
    // TODO: distinguish between different socket errors?
    // console.error('SOCKET ERROR:', error)
    clearTimeout(timeout)
  }
})
