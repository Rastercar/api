import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { SimCardModel } from '../sim-card/sim-card.model'
import { VehicleModel } from '../vehicle/vehicle.model'
import { of } from '../../utils/coverage-helpers'
import { TrackerModel } from './tracker.model'
import { Tracker } from './tracker.entity'

@Resolver(of(TrackerModel))
export class TrackerResolver {
  constructor() {}

  @ResolveField('vehicle', () => VehicleModel)
  async vehicle(@Parent() tracker: Tracker) {
    // TODO: fix-me
    if (!tracker.vehicle?.id) return null
    // return this.vehicleLoader.byId.load(tracker.vehicle.id)
  }

  @ResolveField('simCards', () => [SimCardModel])
  async simCards(@Parent() tracker: Tracker) {
    // TODO: fix-me
    return []
  }
}
