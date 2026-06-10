import { useSignal } from '@preact/signals'
import { Button } from '../../components/library/Button.tsx'
import { showAlertMessage } from '../alert/AlertListener.tsx'

function browserSupportsWebPush() {
  return 'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
}

function urlBase64ToUint8Array(base64_string: string) {
  const padding = '='.repeat((4 - base64_string.length % 4) % 4)
  const base64 = (base64_string + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const raw_data = atob(base64)
  return Uint8Array.from(raw_data, (char) => char.charCodeAt(0))
}

export function EnableWebPushNotifications() {
  const loading = useSignal(false)

  async function enableWebPush() {
    if (loading.value) return
    loading.value = true

    try {
      if (!browserSupportsWebPush()) {
        showAlertMessage({
          level: 'error',
          message: 'Push notifications are not supported in this browser.',
        })
        return
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js')

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        showAlertMessage({
          level: 'warning',
          message: 'Notification permission was not granted. Enable notifications in your browser settings to receive push alerts.',
        })
        return
      }

      const public_key_response = await fetch('/app/web-push-public-key')
      if (!public_key_response.ok) {
        showAlertMessage({
          level: 'error',
          message: 'Could not load push notification configuration. Please try again.',
        })
        return
      }

      const { public_key } = await public_key_response.json()
      if (!public_key) {
        showAlertMessage({
          level: 'error',
          message: 'Push notification configuration is missing. Please contact support.',
        })
        return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key),
      })

      const subscription_json = subscription.toJSON()
      const save_response = await fetch('/app/web-push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription_json.endpoint,
          keys: subscription_json.keys,
        }),
      })

      if (!save_response.ok) {
        showAlertMessage({
          level: 'error',
          message: 'Could not save your push notification subscription. Please try again.',
        })
        return
      }

      showAlertMessage({
        level: 'success',
        message: 'Push notifications enabled. You will receive alerts when you are away from this page.',
      })
    } catch {
      showAlertMessage({
        level: 'error',
        message: 'Could not enable push notifications. Please try again.',
      })
    } finally {
      loading.value = false
    }
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow'>
      <p className='text-sm text-gray-600'>
        Receive alerts on this device when you are not actively using the app.
      </p>
      <Button
        type='button'
        variant='secondary'
        className='mt-3'
        disabled={loading.value}
        onClick={enableWebPush}
      >
        {loading.value ? 'Enabling…' : 'Enable push notifications'}
      </Button>
    </div>
  )
}
