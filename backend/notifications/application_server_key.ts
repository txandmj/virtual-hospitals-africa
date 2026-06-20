export function urlBase64ToUint8Array(base64_string: string) {
  const padding = '='.repeat((4 - base64_string.length % 4) % 4)
  const base64 = (base64_string + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const raw_data = atob(base64)
  return Uint8Array.from(raw_data, (char) => char.charCodeAt(0))
}

function uint8ArraysEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false
  const remaining = [...b]
  for (const byte of a) {
    if (byte !== remaining.shift()) return false
  }
  return true
}

function bufferSourceToUint8Array(value: BufferSource) {
  if (value instanceof Uint8Array) return value
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  }
  return new Uint8Array(value)
}

export function applicationServerKeysMatch(
  subscription_application_server_key: BufferSource | null | undefined,
  vapid_public_key: string,
) {
  if (!subscription_application_server_key) return false
  return uint8ArraysEqual(
    bufferSourceToUint8Array(subscription_application_server_key),
    urlBase64ToUint8Array(vapid_public_key),
  )
}
