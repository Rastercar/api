import { OrganizationRepository } from './repositories/organization.repository'
import { Parent, ResolveField, Resolver, Query } from '@nestjs/graphql'
import { OrganizationModel } from './models/organization.model'
import { Organization } from './entities/organization.entity'
import { of, returns } from '../../utils/coverage-helpers'
import { TrackerModel } from '../tracker/tracker.model'
import { VehicleModel } from '../vehicle/vehicle.model'
import { UserModel } from '../user/models/user.model'
import VehicleLoader from '../vehicle/vehicle.loader'

@Resolver(of(OrganizationModel))
export class OrganizationResolver {
  constructor(readonly organizationRepository: OrganizationRepository, readonly vehicleLoader: VehicleLoader) {}

  @ResolveField('vehicles', () => [VehicleModel])
  async vehicles(@Parent() organization: Organization): Promise<VehicleModel[]> {
    console.log('xasdasd', organization.id)

    await this.organizationRepository.populate(organization, ['vehicles'])
    return organization.vehicles.getItems()
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

  @Query(returns([OrganizationModel]), { nullable: true })
  async organizations(): Promise<OrganizationModel[]> {
    return this.organizationRepository.findAll()
  }
}
