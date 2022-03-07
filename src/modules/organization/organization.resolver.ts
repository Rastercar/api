import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { Organization } from '@prisma/client'

import { PrismaService } from '../../database/prisma.service'
import { of } from '../../utils/coverage-helpers'
import { TrackerModel } from '../tracker/tracker.model'
import { UserModel } from '../user/models/user.model'
import { VehicleModel } from '../vehicle/vehicle.model'
import { OrganizationModel } from './models/organization.model'

@Resolver(of(OrganizationModel))
export class OrganizationResolver {
  constructor(readonly prisma: PrismaService) {}

  @ResolveField('vehicles', () => [VehicleModel])
  async vehicles(@Parent() organization: Organization) {
    return this.prisma.organization
      .findUnique({
        where: { id: organization.id }
      })
      .vehicle()
  }

  @ResolveField('trackers', () => [TrackerModel])
  async trackers(@Parent() organization: Organization): Promise<TrackerModel[]> {
    return this.prisma.organization
      .findUnique({
        where: { id: organization.id }
      })
      .tracker()
  }

  @ResolveField('users', () => [UserModel])
  async users(@Parent() organization: Organization): Promise<UserModel[]> {
    return this.prisma.organization
      .findUnique({
        where: { id: organization.id }
      })
      .users()
  }
}
