import { HttpExceptionFilter } from '../filters/http-exception.filter'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import * as express from 'express'

export const createApp = () => {
  return NestFactory.create(AppModule, { bodyParser: false })
}

/**
 * Setups the nest aplication global middlewares, settings, pipes, etc.
 */
export const setupAppGlobals = (app: INestApplication) => {
  // We need to declare the bodyparser manually since we need disabled it on the appCreation
  // and the reason for that can be found here: https://mikro-orm.io/docs/usage-with-nestjs/
  app.use(express.json())

  app.enableCors({ credentials: true })

  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true }))
}

/**
 * Turns on http listening for the on the port defined on API_PORT
 * enviroment variable for the application
 */
export const initApp = async (app: INestApplication) => {
  const configService = app.get(ConfigService)
  const port = configService.get('API_PORT', 3000)

  await app.listen(port)
}
