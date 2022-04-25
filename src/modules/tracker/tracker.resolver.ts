import { ObjectQuery } from '@mikro-orm/core'
import { Inject } from '@nestjs/common'
import { Args, Context, Int, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { IDataLoaders } from '../../graphql/data-loader/data-loader.service'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { OrderingArgs } from '../../graphql/pagination/ordering'
import { is, of, returns } from '../../utils/coverage-helpers'
import { RequestOrganizationId } from '../auth/decorators/request-organization.decorator'
import { UserAuth } from '../auth/decorators/user-auth.decorator'
import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { PUB_SUB } from '../pubsub/pubsub.module'
import { SimCardModel } from '../sim-card/sim-card.model'
import { VehicleModel } from '../vehicle/vehicle.model'
import { LatLng } from './dto/lat-lng'
import { TrackerSearchFilterArgs } from './dto/tracker-search-filter'
import { Tracker } from './tracker.entity'
import { PositionRecievedEvent, TrackerPositionSubscriptionArgs, TRACKER_EVENTS } from './tracker.events'
import { OffsetPaginatedTracker, TrackerModel } from './tracker.model'
import { TrackerRepository } from './tracker.repository'
import { TrackerService } from './tracker.service'

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

  @ResolveField(() => VehicleModel, { nullable: true })
  vehicle(@Parent() tracker: Tracker, @Context('loaders') loaders: IDataLoaders): Promise<VehicleModel | null> {
    return loaders.vehicle.byTrackerId.load(tracker.id)
  }

  @ResolveField(() => [SimCardModel])
  simCards(@Parent() tracker: Tracker, @Context('loaders') loaders: IDataLoaders): Promise<SimCardModel[]> {
    return loaders.simCard.byTrackerId.load(tracker.id)
  }

  @ResolveField(() => LatLng, { nullable: true })
  async lastPosition(@Parent() tracker: Tracker, @Context('loaders') loaders: IDataLoaders): Promise<LatLng | null> {
    const trackerWithPosition = tracker as Tracker & { lastPosition: LatLng }

    if (trackerWithPosition.lastPosition) return trackerWithPosition.lastPosition

    const lastPos = await loaders.position.lastByTrackerId.load(tracker.id)

    if (!lastPos) return null

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
    @RequestOrganizationId() organization: number
  ): Promise<OffsetPaginatedTracker> {
    const queryFilter: ObjectQuery<Tracker> = { organization }

    if (filter?.installedOnVehicle !== null) {
      queryFilter['vehicle'] = filter?.installedOnVehicle ? { $ne: null } : { $eq: null }
    }

    return this.trackerRepository.findSearchAndPaginate({ search, ordering, pagination, queryFilter })
  }

  @UserAuth()
  @Query(() => [TrackerModel], { description: 'All trackers that can recieve positions (trackers that have one or more sim cards)' })
  activeTrackers(
    @RequestOrganizationId()
    organizationId: number
  ): Promise<TrackerModel[]> {
    return this.trackerRepository.allActiveTrackersForOrganization(organizationId)
  }

  @UserAuth()
  @Mutation(returns(TrackerModel), {
    description: 'Removes a tracker from the the vehicle its installed, optionally removing the sim cards from the removed tracker aswell'
  })
  removeTrackerFromVehicle(
    @RequestOrganizationId() userOrganization: number,
    @Args({ name: 'trackerId', type: is(Int) }) trackerId: number,
    @Args({ name: 'removeSimsFromTracker', type: is(Boolean), nullable: true }) removeSimsFromTracker: boolean | null
  ): Promise<TrackerModel> {
    return this.trackerService.removeTrackerFromCurrentVehicle({
      trackerId,
      userOrganization,
      removeSimCards: removeSimsFromTracker ?? false
    })
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
    @RequestOrganizationId() organization: number
  ) {
    if (trackersToListenIds.length > 0) {
      await this.trackerService.assertTrackersBelongToOrganization({ organization, trackerIds: trackersToListenIds })
    }

    return this.pubSub.asyncIterator<PositionRecievedEvent>(TRACKER_EVENTS.POSITION_RECIEVED)
  }
}
