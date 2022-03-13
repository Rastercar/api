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
import { File } from '../../graphql/common/file'
import { Vehicle } from './vehicle.entity'
import * as path from 'path'
import * as fs from 'fs'

@Resolver(of(VehicleModel))
export class VehicleResolver {
  constructor(
    readonly trackerLoader: TrackerLoader,
    readonly vehicleRepository: VehicleRepository,
    readonly organizationLoader: OrganizationLoader
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
    return this.vehicleRepository.findSearchAndPaginate({ search, ordering, pagination, queryFilter: { organization: user.organization } })
  }

  @UserAuth()
  @Mutation(returns(File))
  async createVehicle(
    @Args({ name: 'photo', type: is(GraphQLUpload), nullable: true }) photo: FileUpload | null,
    @Args({ name: 'data', type: is(CreateVehicleDTO) }) dto: CreateVehicleDTO,
    @RequestUser() user: User
  ): Promise<VehicleModel> {
    console.log('-----------------------------------------------------------------------')
    console.log(photo, dto)

    if (photo) {
      const { createReadStream, filename, mimetype, encoding } = photo

      console.log({ mimetype, encoding })

      const stream = createReadStream()
      const pathname = path.join('test', filename)

      stream.pipe(fs.createWriteStream(pathname))
    }

    const vehicle = new Vehicle(dto)
    vehicle.organization = user.organization

    await this.vehicleRepository.persistAndFlush(vehicle)

    return { filename: '', mimetype: '', encoding: '', uri: 'http://about:blank' } as any
  }
}
