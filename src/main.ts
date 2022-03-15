import { addMikroOrmRequestContextMiddleware, createApp, initApp, setupAppGlobals } from './bootstrap/setup-app'
import { ConfigService } from '@nestjs/config'
import { config } from 'aws-sdk'
import { PUB_SUB } from './modules/pubsub/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'

async function bootstrap() {
  const app = await createApp()

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

  let i = 1111

  setInterval(() => {
    i++
    pub.publish('postAdded', { testSub: { plate: `YYY${i}` } })
  }, 5000)
}

bootstrap()
