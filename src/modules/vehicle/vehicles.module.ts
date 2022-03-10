import OrganizationLoader from '../organization/organization.loader'
import TrackerLoader from '../tracker/tracker.loader'
import { VehicleResolver } from './vehicle.resolver'
import { Tracker } from '../tracker/tracker.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import VehicleLoader from './vehicle.loader'
import { Vehicle } from './vehicle.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Vehicle, Tracker] })],
  providers: [VehicleResolver, VehicleLoader, TrackerLoader, OrganizationLoader],
  exports: [VehicleResolver, VehicleLoader]
})
export class VehicleModule {}
