import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { RequestUser } from '../auth/decorators/request-user.decorator'
import { OffsetPaginatedVehicle, VehicleModel } from './vehicle.model'
import OrganizationLoader from '../organization/organization.loader'
import { UserAuth } from '../auth/decorators/user-auth.decorator'
import { OrderingArgs } from '../../graphql/pagination/ordering'
import { is, of, returns } from '../../utils/coverage-helpers'
import { CreateVehicleDTO } from './dtos/create-vehicle.dto'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { VehicleRepository } from './vehicle.repository'
import { TrackerModel } from '../tracker/tracker.model'
import TrackerLoader from '../tracker/tracker.loader'
import { User } from '../user/entities/user.entity'
import { VehicleService } from './vehicle.service'
import { Vehicle } from './vehicle.entity'
import { Inject } from '@nestjs/common'
import { PUB_SUB } from '../pubsub/pubsub.module'
import { RedisPubSub } from 'graphql-redis-subscriptions'

@Resolver(of(VehicleModel))
export class VehicleResolver {
  constructor(
    readonly trackerLoader: TrackerLoader,
    readonly vehicleService: VehicleService,
    readonly vehicleRepository: VehicleRepository,
    readonly organizationLoader: OrganizationLoader,
    @Inject(PUB_SUB) readonly pubSub: RedisPubSub
  ) {}

  @ResolveField(() => SimpleOrganizationModel)
  organization(@Parent() vehicle: Vehicle): Promise<SimpleOrganizationModel> | SimpleOrganizationModel {
    return vehicle.organization.isInitialized() ? vehicle.organization : this.organizationLoader.byId.load(vehicle.organization.id)
  }

  @ResolveField(() => [TrackerModel])
  trackers(@Parent() vehicle: Vehicle): Promise<TrackerModel[]> {
    return this.trackerLoader.byVehicleId.load(vehicle.id)
  }

  @UserAuth()
  @Query(returns(OffsetPaginatedVehicle), { description: 'The vehicles that belong to the request user organization' })
  vehicles(
    @Args() ordering: OrderingArgs,
    @Args() pagination: OffsetPagination,
    @Args('search', { nullable: true }) search: string,
    @RequestUser() user: User
  ): Promise<OffsetPaginatedVehicle> {
    this.pubSub.publish('postAdded', { plate: 'YYY4444' })
    return this.vehicleRepository.findSearchAndPaginate({ search, ordering, pagination, queryFilter: { organization: user.organization } })
  }

  @UserAuth()
  @Mutation(returns(VehicleModel))
  async createVehicle(
    @Args({ name: 'photo', type: is(GraphQLUpload), nullable: true }) photo: FileUpload | null,
    @Args({ name: 'data', type: is(CreateVehicleDTO) }) dto: CreateVehicleDTO,
    @RequestUser() user: User
  ): Promise<VehicleModel> {
    return this.vehicleService.create(dto, user.organization, photo)
  }
}
