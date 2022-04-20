import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { OrderingArgs } from '../../graphql/pagination/ordering'
import { is, of, returns } from '../../utils/coverage-helpers'
import { UserAuth } from '../auth/decorators/user-auth.decorator'
import { OffsetPaginatedSimCard } from '../sim-card/sim-card.model'
import { SimCardRepository } from '../sim-card/sim-card.repository'
import { OffsetPaginatedTracker } from '../tracker/tracker.model'
import { TrackerRepository } from '../tracker/tracker.repository'
import { OffsetPaginatedUser } from '../user/models/user.model'
import { UserRepository } from '../user/repositories/user.repository'
import { OffsetPaginatedVehicle } from '../vehicle/vehicle.model'
import { VehicleRepository } from '../vehicle/vehicle.repository'
import { Organization } from './entities/organization.entity'
import { OrganizationModel } from './models/organization.model'
import { OrganizationRepository } from './repositories/organization.repository'

@Resolver(of(OrganizationModel))
export class OrganizationResolver {
  constructor(
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

  @ResolveField(() => OffsetPaginatedUser)
  users(@Parent() organization: Organization, @Args() { limit, offset }: OffsetPagination): Promise<OffsetPaginatedUser> {
    return this.userRepository.findAndOffsetPaginate({ limit, offset, queryFilter: { organization } })
  }

  @UserAuth({ allowedUserType: 'masterUser' })
  @Query(returns([OrganizationModel]))
  organizations(): Promise<OrganizationModel[]> {
    return this.organizationRepository.findAll()
  }

  @Query(returns(OrganizationModel), { nullable: true })
  organization(@Args({ name: 'id', type: is(Int) }) id: number): Promise<OrganizationModel> {
    return this.organizationRepository.findOneOrFail({ id })
  }
}
