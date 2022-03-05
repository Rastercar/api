import { TrackerModule } from '../tracker/tracker.module'
import { SimCardResolver } from './sim-card.resolver'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { SimCard } from './sim-card.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [SimCard] }), TrackerModule],
  providers: [SimCardResolver],
  exports: [SimCardResolver]
})
export class SimCardModule {}
