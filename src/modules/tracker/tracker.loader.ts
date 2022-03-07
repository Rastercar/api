import { createByIdLoader } from '../../graphql/data-loader.utils'
import { VehicleRepository } from '../vehicle/vehicle.repository'
import { TrackerRepository } from './tracker.repository'
import { Injectable, Scope } from '@nestjs/common'
import * as DataLoader from 'dataloader'

@Injectable({ scope: Scope.REQUEST })
export default class TrackerLoader {
  constructor(readonly trackerRepository: TrackerRepository, readonly vehicleRepository: VehicleRepository) {}

  byId = createByIdLoader(this.trackerRepository)

  byVehicleId = new DataLoader(async (vehicleIds: readonly number[]) => {
    const trackers = await this.trackerRepository.find({
      vehicle: { id: vehicleIds as number[] }
    })

    const vehicleIdToTrackersMap = new Map(vehicleIds.map(vehicleId => [vehicleId, trackers.filter(t => t.vehicle?.id === vehicleId)]))

    return vehicleIds.map(vehicleId => vehicleIdToTrackersMap.get(vehicleId) ?? [])
  })
}
