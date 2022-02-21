import { OrganizationModule } from './modules/organization/organization.module'
import { HealthcheckModule } from './modules/healthcheck/healthcheck.module'
import { MailerModule } from './modules/mail/mailer.module'
import { GraphqlModule } from './graphql/graphql.module'
import { AuthModule } from './modules/auth/auth.module'
import { ConfigModule } from './config/config.module'
import { OrmModule } from './database/orm.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [OrmModule, MailerModule, ConfigModule, AuthModule, GraphqlModule, OrganizationModule, HealthcheckModule]
})
export class AppModule {}
