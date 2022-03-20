import { VehicleResolver } from './vehicle.resolver'
import { Tracker } from '../tracker/tracker.entity'
import { VehicleService } from './vehicle.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Vehicle } from './vehicle.entity'
import { S3Module } from '../s3/s3.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Vehicle, Tracker] }, 'postgres'), S3Module],
  providers: [VehicleResolver, VehicleService],
  exports: [VehicleResolver, VehicleService]
})
export class VehicleModule {}
