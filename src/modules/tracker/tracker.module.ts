import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Organization } from '../organization/entities/organization.entity'
import { PositionModule } from '../positions/position.module'
import { SimCard } from '../sim-card/sim-card.entity'
import { Vehicle } from '../vehicle/vehicle.entity'
import { Tracker } from './tracker.entity'
import { TrackerResolver } from './tracker.resolver'
import { TrackerService } from './tracker.service'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Tracker, Vehicle, SimCard, Organization] }, 'postgres'), PositionModule],
  providers: [TrackerResolver, TrackerService],
  exports: [TrackerResolver, TrackerService]
})
export class TrackerModule {}
