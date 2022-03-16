import OrganizationLoader from '../organization/organization.loader'
import TrackerLoader from '../tracker/tracker.loader'
import { VehicleResolver } from './vehicle.resolver'
import { Tracker } from '../tracker/tracker.entity'
import { VehicleService } from './vehicle.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import VehicleLoader from './vehicle.loader'
import { Vehicle } from './vehicle.entity'
import { S3Module } from '../s3/s3.module'
import { Module } from '@nestjs/common'
import { TestResolver } from './test.resolver'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Vehicle, Tracker] }, 'postgres'), S3Module],
  providers: [VehicleResolver, TestResolver, VehicleService, VehicleLoader, TrackerLoader, OrganizationLoader],
  exports: [VehicleResolver, VehicleService, VehicleLoader]
})
export class VehicleModule {}
