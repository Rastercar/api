import { VehicleRepository } from './vehicle.repository'
import { Injectable, Scope } from '@nestjs/common'
import * as DataLoader from 'dataloader'

@Injectable({ scope: Scope.REQUEST })
export default class VehicleLoader {
  constructor(readonly vehicleRepository: VehicleRepository) {}

  batchVehicles = new DataLoader(async (vehicleIds: readonly number[]) => {
    const vehicles = await this.vehicleRepository.find({ id: { $in: vehicleIds as number[] } })
    const vehiclesMap = new Map(vehicles.map(vehicle => [vehicle.id, vehicle]))
    return vehicleIds.map(vehicleId => vehiclesMap.get(vehicleId))
  })
}
