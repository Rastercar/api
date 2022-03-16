import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { validationSchema } from './validation.schema'
import postgres from './postgres.config'
import { Module } from '@nestjs/common'
import mongo from './mongo.config'
import { resolve } from 'path'

const envFilePathDict = {
  test: resolve('env', '.test.env'),
  homolog: resolve('env', '.homolog.env'),
  production: resolve('env', '.production.env'),
  development: resolve('env', '.development.env')
}

const envFilePath = envFilePathDict[process.env.NODE_ENV ?? 'development']

@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true, load: [postgres, mongo], envFilePath, validationSchema })],
  exports: [NestConfigModule]
})
export class ConfigModule {}
