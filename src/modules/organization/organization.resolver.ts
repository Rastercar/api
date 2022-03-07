import { OrganizationModel } from './models/organization.model'
import { of } from '../../utils/coverage-helpers'
import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { VehicleModel } from '../vehicle/vehicle.model'
import { organization } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'
import { TrackerModel } from '../tracker/tracker.model'
import { UserModel } from '../user/models/user.model'

@Resolver(of(OrganizationModel))
export class OrganizationResolver {
  constructor(readonly prisma: PrismaService) {}

  @ResolveField('vehicles', () => [VehicleModel])
  async vehicles(@Parent() organization: organization) {
    return this.prisma.organization
      .findUnique({
        where: { id: organization.id }
      })
      .vehicle()
  }

  @ResolveField('trackers', () => [TrackerModel])
  async trackers(@Parent() organization: organization): Promise<TrackerModel[]> {
    return this.prisma.organization
      .findUnique({
        where: { id: organization.id }
      })
      .tracker()
  }

  @ResolveField('users', () => [UserModel])
  async users(@Parent() organization: organization): Promise<UserModel[]> {
    return this.prisma.organization
      .findUnique({
        where: { id: organization.id }
      })
      .users()
  }
}
