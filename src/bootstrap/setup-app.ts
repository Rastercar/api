import { HttpExceptionFilter } from '../filters/http-exception.filter'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { MikroORM, RequestContext } from '@mikro-orm/core'
import { getMikroORMToken } from '@mikro-orm/nestjs'
import { ConfigService } from '@nestjs/config'
import { useContainer } from 'class-validator'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { config } from 'aws-sdk'
import express from 'express'

/**
 * Creates a nestJs application based on the AppModule, also
 * sets class-validator to use the nest DI system internaly
 */
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

/**
 * Creates a request context middleware for mikroOrm entity managers, meaning
 * every time a request is recieved all entity managers will be forked so different
 * request do not affect the same in memory entities
 *
 * **MUST BE AFTER SETUP APP GLOBALS**
 */
export const addMikroOrmRequestContextMiddleware = (app: INestApplication) => {
  const ormPg = app.get(getMikroORMToken('postgres'))
  const ormMongo = app.get(getMikroORMToken('mongo'))

  app.use((req: Express.Request, res: Express.Response, next: () => void) => {
    RequestContext.create([ormMongo.em, ormPg.em], next)
  })
}

/**
 * Sets up the configuration for the aws-sdk module based
 * on the aplication enviroment variables
 */
export const updateAwsConfig = (app: INestApplication) => {
  const configService = app.get(ConfigService)

  config.update({
    region: configService.get('AWS_REGION'),
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY')
  })
}

/**
 * Explicitly creates all collections for mongoDb
 */
export const updateMongoDbSchema = async (app: INestApplication) => {
  const orm = app.get<MikroORM>(getMikroORMToken('mongo'))
  await orm.getSchemaGenerator().createSchema()
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
