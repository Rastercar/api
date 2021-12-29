import { HttpExceptionFilter } from './filters/http-exception.filter'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({ credentials: true })

  app.useGlobalPipes(new ValidationPipe())

  app.useGlobalFilters(new HttpExceptionFilter())

  const configService = app.get(ConfigService)

  const port = configService.get('PORT', 3000)

  await app.listen(port)
}

bootstrap()
