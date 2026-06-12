import { notifications } from '../../db/models/notifications.ts'
import { LoggedInHealthWorkerContext, RenderedNotification } from '../../types.ts'
import upgradeWebsocket from '../../util/websocket.ts'
import last from '../../util/last.ts'

export default upgradeWebsocket((
  ctx: LoggedInHealthWorkerContext,
  socket: WebSocket,
) => {
  let past_ts: Date | undefined
  const health_worker_id = ctx.state.health_worker.id
  let pub_sub: Awaited<ReturnType<typeof notifications.initializeNotificationsPubSub>> | undefined

  const sendIfNew = (new_notification: RenderedNotification) => {
    if (!past_ts || (new_notification.created_at > past_ts)) {
      socket.send(JSON.stringify({
        ...new_notification,
        type: 'new_notification',
      }))
    }
    past_ts = new_notification.created_at
  }

  const on_notification = async (notification_id: string) => {
    try {
      const new_notification = await notifications.getByIdOptional(
        ctx.state.trx,
        notification_id,
        { health_worker_id },
      )
      if (!new_notification) return
      sendIfNew(new_notification)
    } catch (error) {
      console.error(error)
    }
  }

  const cleanup = () => {
    pub_sub?.by_health_worker_id.unsubscribe(health_worker_id, on_notification)
  }

  socket.onopen = async () => {
    pub_sub = await notifications.initializeNotificationsPubSub()
    pub_sub.by_health_worker_id.subscribe(health_worker_id, on_notification)

    const notifs = await notifications.findAll(
      ctx.state.trx,
      { health_worker_id },
    )
    past_ts = last(notifs)?.created_at

    const new_notifications = await notifications.findAll(
      ctx.state.trx,
      { health_worker_id, past_ts },
    )
    for (const new_notification of new_notifications) {
      sendIfNew(new_notification)
    }
  }
  socket.onclose = cleanup
  socket.onerror = cleanup
})
