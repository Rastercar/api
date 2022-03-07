import { Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { resolve } from 'path'

import { validationSchema } from './validation.schema'

const envFilePathDict = {
  test: resolve('env', '.test.env'),
  homolog: resolve('env', '.homolog.env'),
  production: resolve('env', '.production.env'),
  development: resolve('env', '.development.env')
}

const envFilePath = envFilePathDict[process.env.NODE_ENV ?? 'development']

@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true, envFilePath, validationSchema })],
  exports: [NestConfigModule]
})
export class ConfigModule {}
