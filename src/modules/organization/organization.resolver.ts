import { Parent, ResolveField, Resolver, Query, Args, Int } from '@nestjs/graphql'
import { OrganizationRepository } from './repositories/organization.repository'
import { CursorPagination } from '../../graphql/pagination/cursor-pagination'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { UserRepository } from '../user/repositories/user.repository'
import { SimCardRepository } from '../sim-card/sim-card.repository'
import { OffsetPaginatedSimCard } from '../sim-card/sim-card.model'
import { VehicleRepository } from '../vehicle/vehicle.repository'
import { OffsetPaginatedVehicle } from '../vehicle/vehicle.model'
import { OffsetPaginatedTracker } from '../tracker/tracker.model'
import { TrackerRepository } from '../tracker/tracker.repository'
import { OrderingArgs } from '../../graphql/pagination/ordering'
import { OrganizationModel } from './models/organization.model'
import { is, of, returns } from '../../utils/coverage-helpers'
import { Organization } from './entities/organization.entity'
import { CursorPaginatedUser } from '../user/models/user.model'
import VehicleLoader from '../vehicle/vehicle.loader'
import UserLoader from '../user/user.loader'

@Resolver(of(OrganizationModel))
export class OrganizationResolver {
  constructor(
    readonly userLoader: UserLoader,
    readonly vehicleLoader: VehicleLoader,
    readonly userRepository: UserRepository,
    readonly vehicleRepository: VehicleRepository,
    readonly trackerRepository: TrackerRepository,
    readonly simCardRepository: SimCardRepository,
    readonly organizationRepository: OrganizationRepository
  ) {}

  @ResolveField(() => OffsetPaginatedVehicle)
  vehicles(
    @Parent() organization: Organization,
    @Args() ordering: OrderingArgs,
    @Args() pagination: OffsetPagination,
    @Args('search', { nullable: true }) search: string
  ): Promise<OffsetPaginatedVehicle> {
    return this.vehicleRepository.findSearchAndPaginate({ search, ordering, pagination, queryFilter: { organization } })
  }

  @ResolveField(() => OffsetPaginatedTracker)
  trackers(@Parent() organization: Organization, @Args() { limit, offset }: OffsetPagination): Promise<OffsetPaginatedTracker> {
    return this.trackerRepository.findAndOffsetPaginate({ limit, offset, queryFilter: { organization } })
  }

  @ResolveField(() => OffsetPaginatedSimCard)
  simCards(@Parent() organization: Organization, @Args() { limit, offset }: OffsetPagination): Promise<OffsetPaginatedSimCard> {
    return this.simCardRepository.findAndOffsetPaginate({ limit, offset, queryFilter: { organization } })
  }

  // TODO: OFFSET PAGINATE ME
  @ResolveField(() => CursorPaginatedUser)
  users(@Args() pagination: CursorPagination, @Parent() organization: Organization): Promise<CursorPaginatedUser> {
    console.log('resolver', { pagination })

    return this.userRepository.findAndCursorPaginate({
      pagination,
      cursorKey: 'id',
      queryFilter: { organization }
    })
  }

  @Query(returns(OrganizationModel), { nullable: true })
  organization(@Args({ name: 'id', type: is(Int) }) id: number): Promise<OrganizationModel> {
    return this.organizationRepository.findOneOrFail({ id })
  }
}
