import { Args, Context, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql'
import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { IDataLoaders } from '../../graphql/data-loader/data-loader.service'
import { RequestUser } from '../auth/decorators/request-user.decorator'
import { UserAuth } from '../auth/decorators/user-auth.decorator'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { SimCardModel } from '../sim-card/sim-card.model'
import { TrackerRepository } from './tracker.repository'
import { VehicleModel } from '../vehicle/vehicle.model'
import { LatLng } from './dto/lat-lng'
import { User } from '../user/entities/user.entity'
import { PUB_SUB } from '../pubsub/pubsub.module'
import { of } from '../../utils/coverage-helpers'
import { TrackerModel } from './tracker.model'
import { Tracker } from './tracker.entity'
import { Inject } from '@nestjs/common'
import { PositionRecievedEvent, TrackerPositionSubscriptionArgs, TRACKER_EVENTS } from './tracker.events'

@Resolver(of(TrackerModel))
export class TrackerResolver {
  constructor(
    @Inject(PUB_SUB)
    readonly pubSub: RedisPubSub,
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
  @Query(() => [TrackerModel], { description: 'All trackers that can recieve positions (trackers that have one or more sim cards)' })
  allActiveTrackers(@RequestUser() user: User): Promise<TrackerModel[]> {
    return this.trackerRepository.allActiveTrackersForOrganization(user.organization.id)
  }

  @Subscription(() => TrackerModel, {
    name: 'listenToTracker',
    filter: (event: { listenToTracker: TrackerModel }, eventArgs: TrackerPositionSubscriptionArgs) => {
      return eventArgs.ids.includes(event.listenToTracker.id)
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeToTrackerPositions(@Args() _args: TrackerPositionSubscriptionArgs) {
    // TODO: AUTHENTICATE USER HERE
    return this.pubSub.asyncIterator<PositionRecievedEvent>(TRACKER_EVENTS.POSITION_RECIEVED)
  }
}
