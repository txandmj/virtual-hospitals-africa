import { defineConfig } from 'vite'
import { fresh } from '@fresh/plugin-vite'
import tailwindcss from '@tailwindcss/vite'

const PORT = Deno.env.get('PORT') || '8001'

export default defineConfig({
  plugins: [
    fresh(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // preact/debug throws on string event handlers (e.g. onload="...") which is
      // valid HTML for SSR but rejected in dev-only validation. Alias it to preact
      // itself to skip the debug layer without affecting any other functionality.
      'preact/debug': 'preact',
    },
  },
  server: {
    port: parseInt(PORT, 10),
    // // Tell Vite's HMR client to connect through the HTTPS proxy rather than
    // // directly to the Vite HTTP server. Without this, HMR module updates use
    // // raw `fresh-island::` specifiers that the browser can't resolve.
    // origin: `https://localhost:${HTTPS_PROXY_SERVER_PORT}`,
    // hmr: {
    //   protocol: 'wss',
    //   host: 'localhost',
    //   clientPort: HTTPS_PROXY_SERVER_PORT,
    // },
  },
  clearScreen: false,
})
