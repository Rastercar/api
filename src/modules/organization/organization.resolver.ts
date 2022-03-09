import { Parent, ResolveField, Resolver, Query, Args, Int } from '@nestjs/graphql'
import { OrganizationRepository } from './repositories/organization.repository'
import { UserRepository } from '../user/repositories/user.repository'
import { ForwardPagination } from '../../graphql/gql-pagination'
import { OrganizationModel } from './models/organization.model'
import { is, of, returns } from '../../utils/coverage-helpers'
import { Organization } from './entities/organization.entity'
import { PaginatedUser } from '../user/models/user.model'
import { TrackerModel } from '../tracker/tracker.model'
import { VehicleModel } from '../vehicle/vehicle.model'
import VehicleLoader from '../vehicle/vehicle.loader'
import TrackerLoader from '../tracker/tracker.loader'
import UserLoader from '../user/user.loader'

@Resolver(of(OrganizationModel))
export class OrganizationResolver {
  constructor(
    readonly userLoader: UserLoader,
    readonly trackerLoader: TrackerLoader,
    readonly vehicleLoader: VehicleLoader,
    readonly userRepository: UserRepository,
    readonly organizationRepository: OrganizationRepository
  ) {}

  // TODO: PAGINATE ME
  @ResolveField(() => [VehicleModel])
  vehicles(@Parent() organization: Organization): Promise<VehicleModel[]> {
    return this.vehicleLoader.byOrganizationId.load(organization.id)
  }

  // TODO: PAGINATE ME
  @ResolveField(() => [TrackerModel])
  trackers(@Parent() organization: Organization): Promise<TrackerModel[]> {
    return this.trackerLoader.byOrganizationId.load(organization.id)
  }

  // TODO: PAGINATE ME
  @ResolveField(() => PaginatedUser)
  async users(@Args('pagination') { after, first }: ForwardPagination, @Parent() organization: Organization): Promise<PaginatedUser> {
    const users = await this.userRepository.find({ organization, id: { $gt: after } }, { orderBy: [{ id: 'ASC' }], limit: first + 1 })

    // console.log('------------------- usersPag -------------------')
    // console.log({ after, first })

    const firstUser: typeof users[number] | undefined = users[0]
    const lastUser: typeof users[number] | undefined = users[users.length]

    const startCursor = `${firstUser?.id || 0}`
    const endCursor = `${lastUser?.id || 0}`

    const hasNextPage = users.length === first + 1

    // If we have one more user than we requested remove it
    if (hasNextPage) users.pop()

    return {
      edges: users.map(u => ({ node: u, cursor: `${u.id}` })),
      nodes: users,
      pageInfo: {
        // If the pagination asked for 20 users, we query 21, if 21 were retrieved then there is a next page
        hasNextPage,
        // If there is ??? XD
        hasPreviousPage: !!after,

        startCursor,
        endCursor
      }
    }
  }

  @Query(returns(OrganizationModel), { nullable: true })
  organization(@Args({ name: 'id', type: is(Int) }) id: number): Promise<OrganizationModel> {
    return this.organizationRepository.findOneOrFail({ id })
  }
}
