import { Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { resolve } from 'path'
import mongo from './mongo.config'
import postgres from './postgres.config'
import { validationSchema } from './validation.schema'

const envFilePathDict = {
  test: resolve('env', '.test.env'),
  homolog: resolve('env', '.homolog.env'),
  production: resolve('env', '.production.env'),
  development: resolve('env', '.development.env')
}

const isValidNodeEnv = (x: unknown): x is keyof typeof envFilePathDict => {
  return typeof x === 'string' && Object.keys(envFilePathDict).includes(x)
}

const envFilePath = envFilePathDict[isValidNodeEnv(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development']

@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true, load: [postgres, mongo], envFilePath, validationSchema })],
  exports: [NestConfigModule]
})
export class ConfigModule {}
