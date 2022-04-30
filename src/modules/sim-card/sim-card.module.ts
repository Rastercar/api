import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Organization } from '../organization/entities/organization.entity'
import { SimCard } from './sim-card.entity'
import { SimCardResolver } from './sim-card.resolver'
import { SimCardService } from './tracker.service'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [SimCard, Organization] }, 'postgres')],
  providers: [SimCardResolver, SimCardService],
  exports: [SimCardResolver, SimCardService]
})
export class SimCardModule {}
