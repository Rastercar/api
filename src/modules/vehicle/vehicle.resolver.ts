import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { Vehicle } from '@prisma/client'

import { PrismaService } from '../../database/prisma.service'
import { of } from '../../utils/coverage-helpers'
import { TrackerModel } from '../tracker/tracker.model'
import { VehicleModel } from './vehicle.model'

@Resolver(of(VehicleModel))
export class VehicleResolver {
  constructor(readonly prisma: PrismaService) {}

  @ResolveField('trackers', () => [TrackerModel])
  async trackers(@Parent() vehicle: Vehicle): Promise<TrackerModel[]> {
    return this.prisma.vehicle.findUnique({ where: { id: vehicle.id } }).trackers()
  }
}
