import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { VehicleModel } from '../vehicle/vehicle.model'
import VehicleLoader from '../vehicle/vehicle.loader'
import { of } from '../../utils/coverage-helpers'
import { TrackerModel } from './tracker.model'
import { Tracker } from './tracker.entity'
import { SimCardModel } from '../sim-card/sim-card.model'

@Resolver(of(TrackerModel))
export class TrackerResolver {
  constructor(readonly vehicleLoader: VehicleLoader) {}

  @ResolveField('vehicle', () => VehicleModel)
  async vehicle(@Parent() tracker: Tracker) {
    if (!tracker.vehicle?.id) return null
    return this.vehicleLoader.loader.load(tracker.vehicle.id)
  }

  @ResolveField('simCards', () => [SimCardModel])
  async simCards(@Parent() tracker: Tracker) {
    if (!tracker.vehicle?.id) return []
    return this.vehicleLoader.loader.load(tracker.vehicle.id)
  }
}
