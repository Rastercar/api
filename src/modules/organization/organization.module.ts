import { OrganizationResolver } from './organization.resolver'
import { Organization } from './entities/organization.entity'
import { OrganizationService } from './organization.service'
import VehicleLoader from '../vehicle/vehicle.loader'
import { SimCard } from '../sim-card/sim-card.entity'
import { User } from '../user/entities/user.entity'
import { Vehicle } from '../vehicle/vehicle.entity'
import { Tracker } from '../tracker/tracker.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import UserLoader from '../user/user.loader'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Organization, User, Vehicle, Tracker, SimCard] }, 'postgres')],
  providers: [OrganizationService, OrganizationResolver, UserLoader, VehicleLoader],
  exports: [OrganizationService, OrganizationResolver]
})
export class OrganizationModule {}
