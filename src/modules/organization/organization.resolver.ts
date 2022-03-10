import { ForwardPagination, createForwardPagination } from '../../graphql/pagination/cursor-pagination'
import { Parent, ResolveField, Resolver, Query, Args, Int } from '@nestjs/graphql'
import { OrganizationRepository } from './repositories/organization.repository'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { UserRepository } from '../user/repositories/user.repository'
import { VehicleRepository } from '../vehicle/vehicle.repository'
import { OffsetPaginatedVehicle } from '../vehicle/vehicle.model'
import { OrganizationModel } from './models/organization.model'
import { is, of, returns } from '../../utils/coverage-helpers'
import { Organization } from './entities/organization.entity'
import { PaginatedUser } from '../user/models/user.model'
import { TrackerModel } from '../tracker/tracker.model'
import VehicleLoader from '../vehicle/vehicle.loader'
import TrackerLoader from '../tracker/tracker.loader'
import UserLoader from '../user/user.loader'

@Resolver(of(OrganizationModel))
export class OrganizationResolver {
  constructor(
    readonly userLoader: UserLoader,
    readonly trackerLoader: TrackerLoader,
    readonly vehicleLoader: VehicleLoader,
    readonly vehicleRepository: VehicleRepository,
    readonly userRepository: UserRepository,
    readonly organizationRepository: OrganizationRepository
  ) {}

  // TODO: OFFSET PAGINATE ME
  @ResolveField(() => OffsetPaginatedVehicle)
  async vehicles(@Args('pagination') pagination: OffsetPagination, @Parent() organization: Organization): Promise<OffsetPaginatedVehicle> {
    console.log(pagination)
    const vehicles = await this.vehicleRepository.find({ organization }, { limit: pagination.limit, offset: pagination.offset })
    const total = await this.vehicleRepository.count({ organization })

    console.log(pagination.offset, vehicles.length, pagination.offset + vehicles.length, total)

    // TODO: FINISH ME ! ! ! !
    const hasMore = pagination.offset + vehicles.length < total
    const hasPrevious = pagination.offset + vehicles.length < total

    return {
      nodes: vehicles,
      pageInfo: { total, hasMore, hasPrevious }
    }
  }

  // TODO: OFFSET PAGINATE ME
  @ResolveField(() => [TrackerModel])
  trackers(@Parent() organization: Organization): Promise<TrackerModel[]> {
    return this.trackerLoader.byOrganizationId.load(organization.id)
  }

  // TODO: OFFSET PAGINATE ME
  @ResolveField(() => PaginatedUser)
  async users(@Args('pagination') pagination: ForwardPagination, @Parent() organization: Organization): Promise<PaginatedUser> {
    const users = await this.userRepository.find(
      { organization, id: { $gt: pagination.after } },
      { orderBy: [{ id: 'ASC' }], limit: pagination.first + 1 }
    )

    return createForwardPagination({ pagination, rows: users })
  }

  @Query(returns(OrganizationModel), { nullable: true })
  organization(@Args({ name: 'id', type: is(Int) }) id: number): Promise<OrganizationModel> {
    return this.organizationRepository.findOneOrFail({ id })
  }
}
