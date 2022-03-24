import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { IDataLoaders } from '../../graphql/data-loader/data-loader.service'
import { RequestUser } from '../auth/decorators/request-user.decorator'
import { OffsetPaginatedVehicle, VehicleModel } from './vehicle.model'
import { UserAuth } from '../auth/decorators/user-auth.decorator'
import { OrderingArgs } from '../../graphql/pagination/ordering'
import { is, of, returns } from '../../utils/coverage-helpers'
import { CreateVehicleDTO } from './dtos/create-vehicle.dto'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { VehicleRepository } from './vehicle.repository'
import { TrackerModel } from '../tracker/tracker.model'
import { User } from '../user/entities/user.entity'
import { VehicleService } from './vehicle.service'
import { Vehicle } from './vehicle.entity'

@Resolver(of(VehicleModel))
export class VehicleResolver {
  constructor(readonly vehicleService: VehicleService, readonly vehicleRepository: VehicleRepository) {}

  @ResolveField(() => SimpleOrganizationModel)
  organization(
    @Parent() vehicle: Vehicle,
    @Context('loaders') loaders: IDataLoaders
  ): Promise<SimpleOrganizationModel> | SimpleOrganizationModel {
    return vehicle.organization.isInitialized() ? vehicle.organization : loaders.organization.byId.load(vehicle.organization.id)
  }

  @ResolveField(() => [TrackerModel])
  trackers(@Parent() vehicle: Vehicle, @Context('loaders') loaders: IDataLoaders): Promise<TrackerModel[]> {
    return loaders.tracker.byVehicleId.load(vehicle.id)
  }

  @UserAuth()
  @Query(returns(OffsetPaginatedVehicle), { description: 'The vehicles that belong to the request user organization' })
  vehicles(
    @Args() ordering: OrderingArgs,
    @Args() pagination: OffsetPagination,
    @Args('search', { nullable: true }) search: string,
    @RequestUser() user: User
  ): Promise<OffsetPaginatedVehicle> {
    return this.vehicleRepository.findSearchAndPaginate({ search, ordering, pagination, queryFilter: { organization: user.organization } })
  }

  @UserAuth()
  @Mutation(returns(VehicleModel))
  createVehicle(
    @Args({ name: 'data', type: is(CreateVehicleDTO) }) dto: CreateVehicleDTO,
    @Args({ name: 'photo', type: is(GraphQLUpload), nullable: true }) photo: FileUpload | null,
    @RequestUser() user: User
  ): Promise<VehicleModel> {
    return this.vehicleService.create(dto, user.organization, photo)
  }
}
