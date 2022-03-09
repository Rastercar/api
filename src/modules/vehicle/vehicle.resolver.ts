import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { VehicleRepository } from './vehicle.repository'
import { TrackerModel } from '../tracker/tracker.model'
import TrackerLoader from '../tracker/tracker.loader'
import { of } from '../../utils/coverage-helpers'
import { VehicleModel } from './vehicle.model'
import { Vehicle } from './vehicle.entity'

@Resolver(of(VehicleModel))
export class VehicleResolver {
  constructor(readonly vehicleRepository: VehicleRepository, readonly trackerLoader: TrackerLoader) {}

  @ResolveField(() => [TrackerModel])
  trackers(@Parent() vehicle: Vehicle): Promise<TrackerModel[]> {
    return this.trackerLoader.byVehicleId.load(vehicle.id)
  }
}
