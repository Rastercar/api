import { OrganizationModule } from './modules/organization/organization.module'
import { HealthcheckModule } from './modules/healthcheck/healthcheck.module'
import { SimCardModule } from './modules/sim-card/sim-card.module'
import { GraphQLWithUploadModule } from './graphql/graphql.module'
import { VehicleModule } from './modules/vehicle/vehicles.module'
import { TrackerModule } from './modules/tracker/tracker.module'
import { ValidatorModule } from './validators/validator.module'
import { MailerModule } from './modules/mail/mailer.module'
import { AuthModule } from './modules/auth/auth.module'
import { ConfigModule } from './config/config.module'
import { OrmModule } from './database/orm.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    OrmModule,
    AuthModule,
    MailerModule,
    ConfigModule,
    VehicleModule,
    TrackerModule,
    SimCardModule,
    ValidatorModule,
    HealthcheckModule,
    OrganizationModule,
    GraphQLWithUploadModule.forRoot()
  ]
})
export class AppModule {}
