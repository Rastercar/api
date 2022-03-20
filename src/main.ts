import {
  addMikroOrmRequestContextMiddleware,
  updateMongoDbSchema,
  setupAppGlobals,
  updateAwsConfig,
  createApp,
  initApp
} from './bootstrap/setup-app'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { PUB_SUB } from './modules/pubsub/pubsub.module'
import { INestApplication } from '@nestjs/common'

// TODO: remove me
const testPubSub = (app: INestApplication) => {
  const pub = app.get<RedisPubSub>(PUB_SUB)

  let i = 1111

  setInterval(() => {
    i++
    pub.publish('postAdded', { testSub: { plate: `YYY${i}` } })
  }, 5000)
}

async function bootstrap() {
  const app = await createApp()

  app.enableShutdownHooks()

  setupAppGlobals(app)

  // IMPORTANT: MUST BE AFTER SETUP APP GLOBALS
  addMikroOrmRequestContextMiddleware(app)

  updateAwsConfig(app)

  await updateMongoDbSchema(app)

  await initApp(app)

  testPubSub(app)
}

bootstrap()
