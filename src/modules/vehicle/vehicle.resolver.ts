import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { VehicleRepository } from './vehicle.repository'
import { TrackerModel } from '../tracker/tracker.model'
import { of } from '../../utils/coverage-helpers'
import { VehicleModel } from './vehicle.model'
import { Vehicle } from './vehicle.entity'

@Resolver(of(VehicleModel))
export class VehicleResolver {
  constructor(readonly vehicleRepository: VehicleRepository) {}

  @ResolveField('trackers', () => [TrackerModel])
  async trackers(@Parent() vehicle: Vehicle): Promise<TrackerModel[]> {
    await this.vehicleRepository.populate(vehicle, ['trackers'])
    return vehicle.trackers.getItems()
  }
}
