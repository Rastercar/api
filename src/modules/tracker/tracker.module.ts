import { TrackerResolver } from './tracker.resolver'
import { Vehicle } from '../vehicle/vehicle.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { TrackerService } from './tracker.service'
import { Tracker } from './tracker.entity'
import { Module } from '@nestjs/common'
import { PositionModule } from '../positions/position.module'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Tracker, Vehicle] }, 'postgres'), PositionModule],
  providers: [TrackerResolver, TrackerService],
  exports: [TrackerResolver, TrackerService]
})
export class TrackerModule {}
