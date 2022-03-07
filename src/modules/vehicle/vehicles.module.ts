import { VehicleResolver } from './vehicle.resolver'
import { Tracker } from '../tracker/tracker.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import VehicleLoader from './vehicle.loader'
import { Vehicle } from './vehicle.entity'
import { Module } from '@nestjs/common'
import { TrackerModule } from '../tracker/tracker.module'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Vehicle, Tracker] }), TrackerModule],
  providers: [VehicleResolver, VehicleLoader],
  exports: [VehicleResolver, VehicleLoader]
})
export class VehicleModule {}
