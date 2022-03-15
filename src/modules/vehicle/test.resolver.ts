import { RedisPubSub } from 'graphql-redis-subscriptions'
import { Resolver, Subscription } from '@nestjs/graphql'
import { PUB_SUB } from '../pubsub/pubsub.module'
import { of } from '../../utils/coverage-helpers'
import { VehicleModel } from './vehicle.model'
import { Inject } from '@nestjs/common'

@Resolver(of(VehicleModel))
export class TestResolver {
  constructor(@Inject(PUB_SUB) readonly pubSub: RedisPubSub) {}

  @Subscription(() => VehicleModel)
  testSub() {
    return this.pubSub.asyncIterator('postAdded')
  }
}
