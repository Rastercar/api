import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Organization } from '../organization/entities/organization.entity'
import { S3Module } from '../s3/s3.module'
import { Tracker } from '../tracker/tracker.entity'
import { Vehicle } from './vehicle.entity'
import { VehicleResolver } from './vehicle.resolver'
import { VehicleService } from './vehicle.service'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Vehicle, Tracker, Organization] }, 'postgres'), S3Module],
  providers: [VehicleResolver, VehicleService],
  exports: [VehicleResolver, VehicleService]
})
export class VehicleModule {}
