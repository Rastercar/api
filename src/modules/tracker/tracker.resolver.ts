import { Context, Field, ObjectType, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql'
import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { IDataLoaders } from '../../graphql/data-loader/data-loader.service'
import { RequestUser } from '../auth/decorators/request-user.decorator'
import { UserAuth } from '../auth/decorators/user-auth.decorator'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { SimCardModel } from '../sim-card/sim-card.model'
import { TrackerRepository } from './tracker.repository'
import { VehicleModel } from '../vehicle/vehicle.model'
import { User } from '../user/entities/user.entity'
import { PUB_SUB } from '../pubsub/pubsub.module'
import { of } from '../../utils/coverage-helpers'
import { TrackerModel } from './tracker.model'
import { Tracker } from './tracker.entity'
import { Inject } from '@nestjs/common'

// TODO: Remove me
@ObjectType({ description: 'tracker position mock' })
export class LatLng {
  @Field(() => Number)
  lat!: number

  @Field(() => Number)
  lng!: number
}

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

  @UserAuth()
  @Query(() => [TrackerModel], { description: 'All trackers that can recieve positions (trackers that have one or more sim cards)' })
  allActiveTrackers(@RequestUser() user: User): Promise<TrackerModel[]> {
    return this.trackerRepository.allActiveTrackersForOrganization(user.organization.id)
  }

  @Subscription(() => LatLng)
  onPositionRecieved() {
    return this.pubSub.asyncIterator('positionRecieved')
  }
}
