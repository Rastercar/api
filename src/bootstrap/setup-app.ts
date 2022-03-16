import { HttpExceptionFilter } from '../filters/http-exception.filter'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { getMikroORMToken } from '@mikro-orm/nestjs'
import { RequestContext } from '@mikro-orm/core'
import { ConfigService } from '@nestjs/config'
import { useContainer } from 'class-validator'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import * as express from 'express'

export const createApp = async () => {
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  return app
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

export const addMikroOrmRequestContextMiddleware = (app: INestApplication) => {
  const orm = app.get(getMikroORMToken('postgres'))

  app.use((req: Express.Request, res: Express.Response, next: () => void) => {
    RequestContext.create(orm.em, next)
  })
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
