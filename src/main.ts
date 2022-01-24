import { createApp, initApp, setupAppGlobals } from './bootstrap/setup-app'
import { storage } from './database/mikro-orm.config'
import { MikroORM } from '@mikro-orm/core'
import { INestApplication } from '@nestjs/common'

const addMikroOrmContextMiddleware = (app: INestApplication) => {
  const orm = app.get(MikroORM)

  // see: https://mikro-orm.io/docs/usage-with-nestjs/
  app.use((req: Express.Request, res: Express.Response, next: () => void) => {
    storage.run(orm.em.fork(true, true), next)
  })
}

async function bootstrap() {
  const app = await createApp()

  addMikroOrmContextMiddleware(app)
  setupAppGlobals(app)
  initApp(app)
}

bootstrap()
