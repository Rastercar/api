import { OrganizationResolver } from './organization.resolver'
import { Organization } from './entities/organization.entity'
import { OrganizationService } from './organization.service'
import { User } from '../user/entities/user.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import UserLoader from '../user/user.loader'
import TrackerLoader from '../tracker/tracker.loader'
import { Vehicle } from '../vehicle/vehicle.entity'
import VehicleLoader from '../vehicle/vehicle.loader'
import SimCardLoader from '../sim-card/sim-card.loader'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Organization, User, Vehicle] })],
  providers: [OrganizationService, OrganizationResolver, UserLoader, TrackerLoader, VehicleLoader, SimCardLoader],
  exports: [OrganizationService, OrganizationResolver]
})
export class OrganizationModule {}
