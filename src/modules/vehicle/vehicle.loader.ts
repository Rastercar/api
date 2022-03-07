import { createByIdLoader } from '../../graphql/data-loader.utils'
import { VehicleRepository } from './vehicle.repository'
import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.REQUEST })
export default class VehicleLoader {
  constructor(readonly vehicleRepository: VehicleRepository) {}

  byId = createByIdLoader(this.vehicleRepository)
}
