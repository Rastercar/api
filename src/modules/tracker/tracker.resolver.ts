import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { IDataLoaders } from '../../graphql/data-loader/data-loader.service'
import { Context, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { SimCardModel } from '../sim-card/sim-card.model'
import { VehicleModel } from '../vehicle/vehicle.model'
import { of } from '../../utils/coverage-helpers'
import { TrackerModel } from './tracker.model'
import { Tracker } from './tracker.entity'
import { Inject } from '@nestjs/common'
import { PUB_SUB } from '../pubsub/pubsub.module'

@Resolver(of(TrackerModel))
export class TrackerResolver {
  constructor(
    @Inject(PUB_SUB)
    readonly pubSub: RedisPubSub
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

  @Subscription(() => VehicleModel)
  testSub() {
    return this.pubSub.asyncIterator('postAdded')
  }
}
