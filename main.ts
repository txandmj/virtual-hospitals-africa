import { App, staticFiles } from 'fresh'
import httpsUrlPlugin from './plugins/httpsUrl.ts'

export const app = new App()
  // .ws('/xwss', {
  //   open(socket) {
  //     console.log(socket, "jjjClient connected");
  //     socket.send("Hello world");
  //   },
  //   message(socket, event) {
  //     socket.send(`Echo: ${event.data}`);
  //   },
  //   close(socket, code, reason) {
  //     console.log("Client disconnected", code, reason);
  //   },
  // })
  // Add HTTPS URL middleware
  .use(httpsUrlPlugin().middlewares[0].middleware.handler)
  // Add static file serving middleware
  .use(staticFiles())
  // Enable file-system based routing
  .fsRoutes()

globalThis.addEventListener('unhandledrejection', (e) => {
  console.error('Caught unhandled rejection:', e.reason)
  e.preventDefault()
})
