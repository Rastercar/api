import { addMikroOrmRequestContextMiddleware, createApp, initApp, setupAppGlobals } from './bootstrap/setup-app'
import { Position } from './modules/positions/position.entity'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { PUB_SUB } from './modules/pubsub/pubsub.module'
import { getMikroORMToken } from '@mikro-orm/nestjs'
import { ConfigService } from '@nestjs/config'
import { MikroORM } from '@mikro-orm/core'
import { config } from 'aws-sdk'

async function bootstrap() {
  const app = await createApp()

  app.enableShutdownHooks()

  setupAppGlobals(app)

  // IMPORTANT: MUST BE AFTER SETUP APP GLOBALS
  addMikroOrmRequestContextMiddleware(app)

  const configService = app.get(ConfigService)

  config.update({
    region: configService.get('AWS_REGION'),
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY')
  })

  initApp(app)

  const pub = app.get<RedisPubSub>(PUB_SUB)
  const xd = app.get<MikroORM>(getMikroORMToken('mongo'))

  const wew = new Position()
  xd.em.fork().persistAndFlush(wew)

  let i = 1111

  setInterval(() => {
    i++
    pub.publish('postAdded', { testSub: { plate: `YYY${i}` } })
  }, 5000)
}

bootstrap()
