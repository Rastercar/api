import { TrackerResolver } from './tracker.resolver'
import { Vehicle } from '../vehicle/vehicle.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import TrackerLoader from './tracker.loader'
import { Tracker } from './tracker.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Tracker, Vehicle] })],
  providers: [TrackerResolver, TrackerLoader],
  exports: [TrackerResolver, TrackerLoader]
})
export class TrackerModule {}
