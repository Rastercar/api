import { OrganizationRepository } from './repositories/organization.repository'
import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { OrganizationModel } from './models/organization.model'
import { Organization } from './entities/organization.entity'
import { TrackerModel } from '../tracker/tracker.model'
import { VehicleModel } from '../vehicle/vehicle.model'
import { UserModel } from '../user/models/user.model'
import { of } from '../../utils/coverage-helpers'

@Resolver(of(OrganizationModel))
export class OrganizationResolver {
  constructor(readonly organizationRepository: OrganizationRepository) {}

  @ResolveField('vehicles', () => [VehicleModel])
  async vehicles(@Parent() organization: Organization): Promise<VehicleModel[]> {
    await this.organizationRepository.populate(organization, ['vehicles'])
    return organization.vehicles.getItems() as any
  }

  @ResolveField('trackers', () => [TrackerModel])
  async trackers(@Parent() organization: Organization): Promise<TrackerModel[]> {
    await this.organizationRepository.populate(organization, ['trackers'])
    return organization.trackers.getItems()
  }

  @ResolveField('users', () => [UserModel])
  async users(@Parent() organization: Organization): Promise<UserModel[]> {
    await this.organizationRepository.populate(organization, ['users'])
    return organization.users.getItems()
  }
}
