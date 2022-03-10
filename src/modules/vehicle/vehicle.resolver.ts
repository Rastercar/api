import { createForwardPagination, ForwardPagination } from '../../graphql/pagination/cursor-pagination'
import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { RequestUser } from '../auth/decorators/request-user.decorator'
import { UserOnlyGuard } from '../user/guards/user-only-route.guard'
import OrganizationLoader from '../organization/organization.loader'
import { GqlAuthGuard } from '../auth/guards/gql-jwt-auth.guard'
import { PaginatedVehicle, VehicleModel } from './vehicle.model'
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

  // TODO: USE OFFSET PAGINATION HERE
  @UseGuards(GqlAuthGuard, UserOnlyGuard)
  @Query(returns(PaginatedVehicle), { description: 'The vehicles that belong to the request user organization' })
  async vehicles(@Args('pagination') pagination: ForwardPagination, @RequestUser() user: User): Promise<PaginatedVehicle> {
    const vehicles = await this.vehicleRepository.find(
      { organization: user.organization, id: { $gt: pagination.after } },
      { orderBy: [{ id: 'ASC' }], limit: pagination.first + 1 }
    )

    return createForwardPagination({ pagination, rows: vehicles })
  }
}
