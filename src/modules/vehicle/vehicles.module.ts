import { VehicleResolver } from './vehicle.resolver'
import { Module } from '@nestjs/common'

@Module({
  providers: [VehicleResolver],
  exports: [VehicleResolver]
})
export class VehicleModule {}
