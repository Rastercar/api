import { SimpleOrganizationModel } from '../organization/models/organization.model'
import OrganizationLoader from '../organization/organization.loader'
import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { TrackerModel } from '../tracker/tracker.model'
import TrackerLoader from '../tracker/tracker.loader'
import { of } from '../../utils/coverage-helpers'
import { SimCardModel } from './sim-card.model'
import { SimCard } from './sim-card.entity'

@Resolver(of(SimCardModel))
export class SimCardResolver {
  constructor(readonly trackerLoader: TrackerLoader, readonly organizationLoader: OrganizationLoader) {}

  @ResolveField(() => SimpleOrganizationModel)
  async organization(@Parent() simCard: SimCard): Promise<SimpleOrganizationModel> {
    return simCard.organization.isInitialized() ? simCard.organization : this.organizationLoader.byId.load(simCard.organization.id)
  }

  @ResolveField(() => TrackerModel, { nullable: true })
  tracker(@Parent() simCard: SimCard): Promise<TrackerModel | null> {
    return this.trackerLoader.bySimCardId.load(simCard.id)
  }
}
