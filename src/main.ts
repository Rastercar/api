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

  let posIdx = 0

  const pos = [
    { lat: -20.4662829, lng: -54.576612 },
    { lat: -20.4672829, lng: -54.577612 },
    { lat: -20.4682829, lng: -54.578612 },
    { lat: -20.4692829, lng: -54.579612 },
    { lat: -20.4702829, lng: -54.580612 },
    { lat: -20.4692829, lng: -54.579612 },
    { lat: -20.4682829, lng: -54.578612 },
    { lat: -20.4672829, lng: -54.577612 },
    { lat: -20.4662829, lng: -54.576612 }
  ]

  setInterval(() => {
    pub.publish('positionRecieved', {
      onPositionRecieved: {
        lat: pos[posIdx].lat,
        lng: pos[posIdx].lng
      }
    })

    posIdx = posIdx === pos.length - 1 ? 0 : posIdx + 1
  }, 2500)
}

async function bootstrap() {
  const app = await createApp()

  app.enableShutdownHooks()

  setupAppGlobals(app)

  addMikroOrmRequestContextMiddleware(app)

  updateAwsConfig(app)

  await updateMongoDbSchema(app)

  await initApp(app)

  testPubSub(app)
}

bootstrap()
