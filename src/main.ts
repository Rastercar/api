import { createApp, initApp, setupAppGlobals } from './bootstrap/setup-app'
import { MikroORM, RequestContext } from '@mikro-orm/core'
import { INestApplication } from '@nestjs/common'

const addMikroOrmContextMiddleware = (app: INestApplication) => {
  const orm = app.get(MikroORM)

  app.use((req, res, next) => {
    RequestContext.create(orm.em, next)
  })
}

async function bootstrap() {
  const app = await createApp()

  setupAppGlobals(app)

  // IMPORTANT: MUST BE AFTER SETUP APP GLOBALS
  addMikroOrmContextMiddleware(app)

  initApp(app)
}

bootstrap()
