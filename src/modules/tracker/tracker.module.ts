import SimCardLoader from '../sim-card/sim-card.loader'
import VehicleLoader from '../vehicle/vehicle.loader'
import { TrackerResolver } from './tracker.resolver'
import { Vehicle } from '../vehicle/vehicle.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import TrackerLoader from './tracker.loader'
import { Tracker } from './tracker.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Tracker, Vehicle] })],
  providers: [TrackerResolver, TrackerLoader, VehicleLoader, SimCardLoader],
  exports: [TrackerResolver, TrackerLoader]
})
export class TrackerModule {}
