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
  },
  clearScreen: false,
})
