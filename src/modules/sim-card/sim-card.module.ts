import TrackerLoader from '../tracker/tracker.loader'
import { SimCardResolver } from './sim-card.resolver'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import SimCardLoader from './sim-card.loader'
import { SimCard } from './sim-card.entity'
import { Module } from '@nestjs/common'
import OrganizationLoader from '../organization/organization.loader'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [SimCard] })],
  providers: [SimCardResolver, TrackerLoader, SimCardLoader, OrganizationLoader],
  exports: [SimCardResolver]
})
export class SimCardModule {}
