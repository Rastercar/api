import { createApp, initApp, setupAppGlobals } from './bootstrap/setup-app'

async function bootstrap() {
  const app = await createApp()
  setupAppGlobals(app)
  initApp(app)
}

bootstrap()
