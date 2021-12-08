import { ConfigModule as NestConfigModule } from '@nestjs/config'
import database from './database.config'
import { Module } from '@nestjs/common'

const envFilePathDict = {
  test: 'env/.test.env',
  production: 'env/.production.env',
  development: 'env/.development.env'
}

const envFilePath = envFilePathDict[process.env.NODE_ENV ?? 'development']

@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true, load: [database], envFilePath })],
  exports: [NestConfigModule]
})
export class ConfigModule {}
