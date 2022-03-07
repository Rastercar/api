import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { setupAppGlobals } from './bootstrap/setup-app'


async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  setupAppGlobals(app)

  const configService = app.get(ConfigService)
  const port = configService.get('API_PORT', 3000)

  await app.listen(port)
}

bootstrap()
