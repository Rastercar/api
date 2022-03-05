import { VehicleModule } from '../vehicle/vehicles.module'
import { TrackerResolver } from './tracker.resolver'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Tracker } from './tracker.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Tracker] }), VehicleModule],
  providers: [TrackerResolver],
  exports: [TrackerResolver]
})
export class TrackerModule {}
