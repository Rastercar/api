import { addMikroOrmRequestContextMiddleware, createApp, initApp, setupAppGlobals } from './bootstrap/setup-app'

async function bootstrap() {
  const app = await createApp()

  setupAppGlobals(app)

  // IMPORTANT: MUST BE AFTER SETUP APP GLOBALS
  addMikroOrmRequestContextMiddleware(app)

  initApp(app)
}

bootstrap()
