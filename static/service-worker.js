addEventListener('push', (event) => {
  var title = 'New VHA notification'
  var body = 'You have a new notification.'
  var url = '/app/notifications'
  var notification_id

  if (event.data) {
    var payload
    try {
      payload = event.data.json()
    } catch (_e) {
      body = event.data.text()
      payload = null
    }

    if (payload) {
      if (payload.title) title = payload.title
      if (payload.body) body = payload.body
      if (payload.url) url = payload.url
      if (payload.notification_id) notification_id = payload.notification_id
    }
  }

  var data = { url }
  if (notification_id) data.notification_id = notification_id

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data,
    }),
  )
})

addEventListener('notificationclick', (event) => {
  event.notification.close()

  var url = event.notification.data?.url || '/app'

  event.waitUntil((async () => {
    var window_clients = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })

    if (window_clients.length) {
      var client = window_clients[0]

      if ('navigate' in client) {
        await client.navigate(url)
      }

      return client.focus()
    }

    return clients.openWindow(url)
  })())
})
