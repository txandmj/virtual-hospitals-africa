// With this we can use test functions connecting to the dev server, such as for scripts
export const port = Deno.env.get('HTTPS_PROXY_SERVER_PORT') || (
  Deno.env.get('IS_TEST') ? '8005' : '8000'
)

export const route = Deno.env.get('SCRIPT_VHA_ROUTE') || `https://localhost:${port}`

export const wss_route = `wss://localhost:${port}`
