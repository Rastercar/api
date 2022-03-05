import { VehicleResolver } from './vehicle.resolver'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import VehicleLoader from './vehicle.loader'
import { Vehicle } from './vehicle.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Vehicle] })],
  providers: [VehicleResolver, VehicleLoader],
  exports: [VehicleResolver, VehicleLoader]
})
export class VehicleModule {}
