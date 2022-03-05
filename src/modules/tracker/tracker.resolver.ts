import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { VehicleModel } from '../vehicle/vehicle.model'
import VehicleLoader from '../vehicle/vehicle.loader'
import { of } from '../../utils/coverage-helpers'
import { TrackerModel } from './tracker.model'
import { Tracker } from './tracker.entity'

@Resolver(of(TrackerModel))
export class TrackerResolver {
  constructor(readonly vehicleLoader: VehicleLoader) {}

  @ResolveField('vehicle', () => VehicleModel)
  async vehicle(@Parent() tracker: Tracker) {
    if (!tracker.vehicle?.id) return null
    return this.vehicleLoader.batchVehicles.load(tracker.vehicle.id)
  }
}
