import { PositionRecievedEvent, TrackerPositionSubscriptionArgs, TRACKER_EVENTS } from './tracker.events'
import { Args, Context, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql'
import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { IDataLoaders } from '../../graphql/data-loader/data-loader.service'
import { Organization } from '../organization/entities/organization.entity'
import { RequestUser } from '../auth/decorators/request-user.decorator'
import { OffsetPaginatedTracker, TrackerModel } from './tracker.model'
import { TrackerSearchFilterArgs } from './dto/tracker-search-filter'
import { UserAuth } from '../auth/decorators/user-auth.decorator'
import { OrderingArgs } from '../../graphql/pagination/ordering'
import { of, returns } from '../../utils/coverage-helpers'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { SimCardModel } from '../sim-card/sim-card.model'
import { TrackerRepository } from './tracker.repository'
import { VehicleModel } from '../vehicle/vehicle.model'
import { User } from '../user/entities/user.entity'
import { TrackerService } from './tracker.service'
import { PUB_SUB } from '../pubsub/pubsub.module'
import { ObjectQuery } from '@mikro-orm/core'
import { Tracker } from './tracker.entity'
import { Inject } from '@nestjs/common'
import { LatLng } from './dto/lat-lng'

@Resolver(of(TrackerModel))
export class TrackerResolver {
  constructor(
    @Inject(PUB_SUB)
    readonly pubSub: RedisPubSub,
    readonly trackerService: TrackerService,
    readonly trackerRepository: TrackerRepository
  ) {}

  @ResolveField(() => SimpleOrganizationModel)
  organization(
    @Parent() tracker: Tracker,
    @Context('loaders') loaders: IDataLoaders
  ): SimpleOrganizationModel | Promise<SimpleOrganizationModel> {
    return tracker.organization.isInitialized() ? tracker.organization : loaders.organization.byId.load(tracker.organization.id)
  }

  @ResolveField(() => VehicleModel)
  vehicle(@Parent() tracker: Tracker, @Context('loaders') loaders: IDataLoaders): Promise<VehicleModel | null> {
    return loaders.vehicle.byTrackerId.load(tracker.id)
  }

  @ResolveField(() => [SimCardModel])
  simCards(@Parent() tracker: Tracker, @Context('loaders') loaders: IDataLoaders): Promise<SimCardModel[]> {
    return loaders.simCard.byTrackerId.load(tracker.id)
  }

  @ResolveField(() => LatLng, { nullable: true })
  async lastPosition(@Parent() tracker: Tracker, @Context('loaders') loaders: IDataLoaders): Promise<LatLng> {
    const trackerWithPosition = tracker as Tracker & { lastPosition: LatLng }

    if (trackerWithPosition.lastPosition) return trackerWithPosition.lastPosition

    const lastPos = await loaders.position.lastByTrackerId.load(tracker.id)
    const [lat, lng] = lastPos.point.coordinates

    return { lat, lng }
  }

  @UserAuth()
  @Query(returns(OffsetPaginatedTracker), { description: 'Trackers that belong to the request user organization' })
  trackers(
    @Args() ordering: OrderingArgs,
    @Args() pagination: OffsetPagination,
    @Args('search', { nullable: true }) search: string,
    @Args({ type: () => TrackerSearchFilterArgs, nullable: true }) filter: TrackerSearchFilterArgs | null,
    @RequestUser() user: User
  ): Promise<OffsetPaginatedTracker> {
    const queryFilter: ObjectQuery<Tracker> = { organization: user.organization }

    if (filter?.installedOnVehicle !== null) {
      queryFilter['vehicle'] = filter?.installedOnVehicle ? { $ne: null } : { $eq: null }
    }

    return this.trackerRepository.findSearchAndPaginate({ search, ordering, pagination, queryFilter })
  }

  @UserAuth()
  @Query(() => [TrackerModel], { description: 'All trackers that can recieve positions (trackers that have one or more sim cards)' })
  activeTrackers(@RequestUser() user: User): Promise<TrackerModel[]> {
    return this.trackerRepository.allActiveTrackersForOrganization(user.organization.id)
  }

  @Subscription(() => TrackerModel, {
    name: 'listenToTracker',
    filter: (event: { listenToTracker: TrackerModel }, eventArgs: TrackerPositionSubscriptionArgs) => {
      return eventArgs.ids.includes(event.listenToTracker.id)
    }
  })
  @UserAuth()
  async subscribeToTrackerPositions(
    @Args() { ids: trackersToListenIds }: TrackerPositionSubscriptionArgs,
    @RequestUser('organization') userOrg: Organization
  ) {
    if (trackersToListenIds.length > 0) {
      await this.trackerService.assertTrackersBelongToOrganization({ organization: userOrg.id, trackerIds: trackersToListenIds })
    }

    return this.pubSub.asyncIterator<PositionRecievedEvent>(TRACKER_EVENTS.POSITION_RECIEVED)
  }
}
