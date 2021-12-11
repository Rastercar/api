import { GraphqlModule } from './graphql/graphql.module'
import { AuthModule } from './modules/auth/auth.module'
import { ConfigModule } from './config/config.module'
import { OrmModule } from './database/orm.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { Module } from '@nestjs/common'

@Module({
  imports: [OrmModule, ConfigModule, AuthModule, GraphqlModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
