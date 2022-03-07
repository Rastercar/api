import { Module } from '@nestjs/common'

import { ConfigModule } from './config/config.module'
import { OrmModule } from './database/orm.module'
import { GraphqlModule } from './graphql/graphql.module'
import { AuthModule } from './modules/auth/auth.module'
import { HealthcheckModule } from './modules/healthcheck/healthcheck.module'
import { MailerModule } from './modules/mail/mailer.module'
import { OrganizationModule } from './modules/organization/organization.module'
import { VehicleModule } from './modules/vehicle/vehicles.module'


@Module({
  imports: [OrmModule, MailerModule, ConfigModule, AuthModule, GraphqlModule, OrganizationModule, HealthcheckModule, VehicleModule]
})
export class AppModule {}
