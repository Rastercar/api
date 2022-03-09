import { OrganizationResolver } from './organization.resolver'
import { Organization } from './entities/organization.entity'
import { OrganizationService } from './organization.service'
import { VehicleModule } from '../vehicle/vehicles.module'
import { User } from '../user/entities/user.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import UserLoader from '../user/user.loader'
import TrackerLoader from '../tracker/tracker.loader'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Organization, User] }), VehicleModule],
  providers: [OrganizationService, OrganizationResolver, UserLoader, TrackerLoader],
  exports: [OrganizationService, OrganizationResolver]
})
export class OrganizationModule {}
