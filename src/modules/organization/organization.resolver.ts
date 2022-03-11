import { CursorPagination, createForwardPagination } from '../../graphql/pagination/cursor-pagination'
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
import { SimCardModel } from '../sim-card/sim-card.model'
import SimCardLoader from '../sim-card/sim-card.loader'

@Resolver(of(OrganizationModel))
export class OrganizationResolver {
  constructor(
    readonly userLoader: UserLoader,
    readonly trackerLoader: TrackerLoader,
    readonly simCardLoader: SimCardLoader,
    readonly vehicleLoader: VehicleLoader,
    readonly userRepository: UserRepository,
    readonly vehicleRepository: VehicleRepository,
    readonly organizationRepository: OrganizationRepository
  ) {}

  // TODO: OFFSET PAGINATE ME (FINISH PAGINATION ON ROOT VEHICLES QUERY AND USE IT HERE (DONT DUPLICATE CODE))
  @ResolveField(() => OffsetPaginatedVehicle)
  async vehicles(@Args() pagination: OffsetPagination, @Parent() organization: Organization): Promise<OffsetPaginatedVehicle> {
    const [vehicles, total] = await Promise.all([
      this.vehicleRepository.find({ organization }, { limit: pagination.limit, offset: pagination.offset }),
      this.vehicleRepository.count({ organization })
    ])

    const hasMore = pagination.offset + vehicles.length < total
    const hasPrevious = !!pagination.offset

    return { nodes: vehicles, pageInfo: { total, hasMore, hasPrevious } }
  }

  // TODO: OFFSET PAGINATE ME
  @ResolveField(() => [TrackerModel])
  trackers(@Parent() organization: Organization): Promise<TrackerModel[]> {
    return this.trackerLoader.byOrganizationId.load(organization.id)
  }

  // TODO: OFFSET PAGINATE ME
  @ResolveField(() => [SimCardModel])
  simCards(@Parent() organization: Organization): Promise<SimCardModel[]> {
    return this.simCardLoader.byOrganizationId.load(organization.id)
  }

  // TODO: OFFSET PAGINATE ME
  @ResolveField(() => PaginatedUser)
  async users(@Args() pagination: CursorPagination, @Parent() organization: Organization): Promise<PaginatedUser> {
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
