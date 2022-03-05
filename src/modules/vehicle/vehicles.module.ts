import { VehicleResolver } from './vehicle.resolver'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Vehicle } from './vehicle.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Vehicle] })],
  providers: [VehicleResolver],
  exports: [VehicleResolver]
})
export class VehicleModule {}
