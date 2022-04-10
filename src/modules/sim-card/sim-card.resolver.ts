import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { IDataLoaders } from '../../graphql/data-loader/data-loader.service'
import { SimCardModel, OffsetPaginatedSimCard } from './sim-card.model'
import { RequestUser } from '../auth/decorators/request-user.decorator'
import { SimCardSearchFilterArgs } from './dto/sim-card-search-filter'
import { UserAuth } from '../auth/decorators/user-auth.decorator'
import { OrderingArgs } from '../../graphql/pagination/ordering'
import { of, returns } from '../../utils/coverage-helpers'
import { SimCardRepository } from './sim-card.repository'
import { TrackerModel } from '../tracker/tracker.model'
import { User } from '../user/entities/user.entity'
import { ObjectQuery } from '@mikro-orm/core'
import { SimCard } from './sim-card.entity'

@Resolver(of(SimCardModel))
export class SimCardResolver {
  constructor(readonly simCardRepository: SimCardRepository) {}

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

  @UserAuth()
  @Query(returns(OffsetPaginatedSimCard), { description: 'Sim cards that belong to the request user organization' })
  simCards(
    @Args() ordering: OrderingArgs,
    @Args() pagination: OffsetPagination,
    @Args('search', { nullable: true }) search: string,
    @Args({ type: () => SimCardSearchFilterArgs, nullable: true }) filter: SimCardSearchFilterArgs | null,
    @RequestUser() user: User
  ): Promise<OffsetPaginatedSimCard> {
    const queryFilter: ObjectQuery<SimCard> = { organization: user.organization }

    if (filter?.installedOnTracker !== null) {
      queryFilter['tracker'] = filter?.installedOnTracker ? { $ne: null } : { $eq: null }
    }

    return this.simCardRepository.findSearchAndPaginate({ search, ordering, pagination, queryFilter })
  }
}
