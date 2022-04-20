import { Args, Context, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { IDataLoaders } from '../../graphql/data-loader/data-loader.service'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { OrderingArgs } from '../../graphql/pagination/ordering'
import { is, of, returns } from '../../utils/coverage-helpers'
import { RequestOrganizationId } from '../auth/decorators/request-organization.decorator'
import { UserAuth } from '../auth/decorators/user-auth.decorator'
import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { OrganizationRepository } from '../organization/repositories/organization.repository'
import { CreateTrackerDTO } from '../tracker/dto/crud-tracker.dto'
import { TrackerModel } from '../tracker/tracker.model'
import { CreateVehicleDTO, UpdateVehicleDTO } from './dtos/crud-vehicle.dto'
import { Vehicle } from './vehicle.entity'
import { OffsetPaginatedVehicle, VehicleModel } from './vehicle.model'
import { VehicleRepository } from './vehicle.repository'
import { VehicleService } from './vehicle.service'

@Resolver(of(VehicleModel))
export class VehicleResolver {
  constructor(
    readonly vehicleService: VehicleService,
    readonly vehicleRepository: VehicleRepository,
    readonly organizationRepository: OrganizationRepository
  ) {}

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
  @Query(returns(OffsetPaginatedVehicle), { description: 'Vehicles that belong to the request user organization' })
  vehicles(
    @Args() ordering: OrderingArgs,
    @Args() pagination: OffsetPagination,
    @Args('search', { nullable: true }) search: string,
    @RequestOrganizationId() organization: number
  ): Promise<OffsetPaginatedVehicle> {
    return this.vehicleRepository.findSearchAndPaginate({ search, ordering, pagination, queryFilter: { organization } })
  }

  @UserAuth()
  @Query(returns(VehicleModel), { nullable: true })
  vehicle(@Args('id', { type: () => Int }) id: number, @RequestOrganizationId() organization: number): Promise<VehicleModel | null> {
    return this.vehicleRepository.findOne({ id, organization })
  }

  @UserAuth()
  @Mutation(returns(VehicleModel))
  async createVehicle(
    @RequestOrganizationId() orgId: number,
    @Args({ name: 'data', type: is(CreateVehicleDTO) }) dto: CreateVehicleDTO,
    @Args({ name: 'photo', type: is(GraphQLUpload), nullable: true }) photo: FileUpload | null
  ): Promise<VehicleModel> {
    const organization = await this.organizationRepository.findOneOrFail({ id: orgId })
    return this.vehicleService.create({ dto, organization, photo })
  }

  @UserAuth()
  @Mutation(returns(VehicleModel))
  updateVehicle(
    @RequestOrganizationId() userOrganization: number,
    @Args({ name: 'id', type: is(Int) }) id: number,
    @Args({ name: 'data', type: is(UpdateVehicleDTO) }) dto: UpdateVehicleDTO,
    @Args({ name: 'photo', type: is(GraphQLUpload), nullable: true }) photo: FileUpload | null
  ): Promise<VehicleModel> {
    return this.vehicleService.update({ dto, userOrganization, id, newPhoto: photo })
  }

  @UserAuth()
  @Mutation(returns(VehicleModel), { description: 'Sets the trackers associated with the vehicle' })
  setVehicleTrackers(
    @RequestOrganizationId() userOrganization: number,
    @Args({ name: 'id', type: is(Int) }) id: number,
    @Args({ name: 'trackerIds', type: is([Int]) }) trackerIds: number[]
  ): Promise<VehicleModel> {
    return this.vehicleService.setTrackers({ vehicleId: id, userOrganization, trackerIds })
  }

  @UserAuth()
  @Mutation(returns(VehicleModel), {
    description: 'Creates a new tracker and/or its new simCards and associate the tracker with a existing vehicle'
  })
  async installTrackerOnVehicle(
    @RequestOrganizationId() userOrganization: number,
    @Args({ name: 'id', type: is(Int) }) vehicleId: number,
    @Args({ name: 'tracker', type: is(CreateTrackerDTO) }) dto: CreateTrackerDTO
  ): Promise<VehicleModel> {
    await this.vehicleService.installNewTracker({ vehicleId, userOrganization, dto })
    return this.vehicleRepository.findOneOrFail({ id: vehicleId })
  }
}
