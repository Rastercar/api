import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { IDataLoaders } from '../../graphql/data-loader/data-loader.service'
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { TrackerModel } from '../tracker/tracker.model'
import { of } from '../../utils/coverage-helpers'
import { SimCardModel } from './sim-card.model'
import { SimCard } from './sim-card.entity'

@Resolver(of(SimCardModel))
export class SimCardResolver {
  @ResolveField(() => SimpleOrganizationModel)
  organization(
    @Parent() simCard: SimCard,
    @Context('loaders') loaders: IDataLoaders
  ): Promise<SimpleOrganizationModel> | SimpleOrganizationModel {
    return simCard.organization.isInitialized() ? simCard.organization : loaders.organization.byId.load(simCard.organization.id)
  }

  @ResolveField(() => TrackerModel, { nullable: true })
  tracker(@Parent() simCard: SimCard, @Context('loaders') loaders: IDataLoaders): Promise<TrackerModel | null> {
    return loaders.tracker.bySimCardId.load(simCard.id)
  }
}
