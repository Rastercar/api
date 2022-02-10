import { createApp, initApp, setupAppGlobals } from './bootstrap/setup-app'
import { storage } from './database/mikro-orm.config'
import { INestApplication } from '@nestjs/common'
import { MikroORM } from '@mikro-orm/core'

const addMikroOrmContextMiddleware = (app: INestApplication) => {
  const orm = app.get(MikroORM)

  // see: https://mikro-orm.io/docs/usage-with-nestjs/
  app.use((req: Express.Request, res: Express.Response, next: () => void) => {
    storage.run(orm.em.fork({ useContext: true }), next)
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
