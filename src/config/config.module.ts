import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { validationSchema } from './validation.schema'
import database from './database.config'
import { Module } from '@nestjs/common'
import { resolve } from 'path'

const envFilePathDict = {
  test: resolve('env', '.test.env'),
  production: resolve('env', '.production.env'),
  development: resolve('env', '.development.env'),
  homolog: resolve('env', '.homolog.env')
}

const envFilePath = envFilePathDict[process.env.NODE_ENV ?? 'development']

@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true, load: [database], envFilePath, validationSchema, expandVariables: true })],
  exports: [NestConfigModule]
})
export class ConfigModule {}
