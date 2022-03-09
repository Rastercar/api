import { VehicleResolver } from './vehicle.resolver'
import TrackerLoader from '../tracker/tracker.loader'
import { Tracker } from '../tracker/tracker.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import VehicleLoader from './vehicle.loader'
import { Vehicle } from './vehicle.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Vehicle, Tracker] })],
  providers: [VehicleResolver, VehicleLoader, TrackerLoader],
  exports: [VehicleResolver, VehicleLoader]
})
export class VehicleModule {}
