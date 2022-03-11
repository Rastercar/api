import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { RequestUser } from '../auth/decorators/request-user.decorator'
import { OffsetPaginatedVehicle, VehicleModel } from './vehicle.model'
import { UserOnlyGuard } from '../user/guards/user-only-route.guard'
import OrganizationLoader from '../organization/organization.loader'
import { GqlAuthGuard } from '../auth/guards/gql-jwt-auth.guard'
import { OrderingArgs } from '../../graphql/pagination/ordering'
import { of, returns } from '../../utils/coverage-helpers'
import { VehicleRepository } from './vehicle.repository'
import { TrackerModel } from '../tracker/tracker.model'
import TrackerLoader from '../tracker/tracker.loader'
import { User } from '../user/entities/user.entity'
import { UseGuards } from '@nestjs/common'
import { Vehicle } from './vehicle.entity'
import { wrap } from '@mikro-orm/core'

@Resolver(of(VehicleModel))
export class VehicleResolver {
  constructor(
    readonly trackerLoader: TrackerLoader,
    readonly vehicleRepository: VehicleRepository,
    readonly organizationLoader: OrganizationLoader
  ) {}

  @ResolveField(() => SimpleOrganizationModel)
  async organization(@Parent() vehicle: Vehicle): Promise<SimpleOrganizationModel> {
    return wrap(vehicle.organization).isInitialized() ? vehicle.organization : this.organizationLoader.byId.load(vehicle.organization.id)
  }

  @ResolveField(() => [TrackerModel])
  trackers(@Parent() vehicle: Vehicle): Promise<TrackerModel[]> {
    return this.trackerLoader.byVehicleId.load(vehicle.id)
  }

  @UseGuards(GqlAuthGuard, UserOnlyGuard)
  @Query(returns(OffsetPaginatedVehicle), { description: 'The vehicles that belong to the request user organization' })
  vehicles(
    @Args() ordering: OrderingArgs,
    @Args() pagination: OffsetPagination,
    @Args('search', { nullable: true }) search: string,
    @RequestUser() user: User
  ): Promise<OffsetPaginatedVehicle> {
    return this.vehicleRepository.findSearchAndPaginate({
      search,
      ordering,
      pagination,
      queryFilter: { organization: user.organization }
    })
  }
}
