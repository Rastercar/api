import { of } from '../../utils/coverage-helpers'
import { VehicleModel } from './vehicle.model'
import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { TrackerModel } from '../tracker/tracker.model'
import { vehicle } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'

@Resolver(of(VehicleModel))
export class VehicleResolver {
  constructor(readonly prisma: PrismaService) {}

  @ResolveField('trackers', () => [TrackerModel])
  async trackers(@Parent() vehicle: vehicle): Promise<TrackerModel[]> {
    return this.prisma.vehicle.findUnique({ where: { id: vehicle.id } }).tracker()
  }
}
