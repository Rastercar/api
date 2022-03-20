import { TrackerResolver } from './tracker.resolver'
import { Vehicle } from '../vehicle/vehicle.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Tracker } from './tracker.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Tracker, Vehicle] }, 'postgres')],
  providers: [TrackerResolver],
  exports: [TrackerResolver]
})
export class TrackerModule {}
