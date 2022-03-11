import { getOrderingClause, OrderingArgs } from '../../graphql/pagination/ordering'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { OffsetPaginatedVehicle, VEHICLE_ORDERABLE_FIELDS } from './vehicle.model'
import { EntityRepository } from '@mikro-orm/postgresql'
import { FindOptions, ObjectQuery } from '@mikro-orm/core'
import { Vehicle } from './vehicle.entity'

interface FindSearchAndPaginateArgs {
  queryFilter: ObjectQuery<Vehicle>
  ordering: OrderingArgs
  pagination: OffsetPagination
  search: string
}

export class VehicleRepository extends EntityRepository<Vehicle> {
  async findSearchAndPaginate({ queryFilter, ordering, pagination, search }: FindSearchAndPaginateArgs): Promise<OffsetPaginatedVehicle> {
    const { limit, offset } = pagination

    const queryOptions: FindOptions<Vehicle> = { limit, offset, ...getOrderingClause<Vehicle>(ordering, VEHICLE_ORDERABLE_FIELDS) }

    if (search) queryFilter.plate = { $ilike: `${search}%` }

    // prettier-ignore
    const [vehicles, total] = await Promise.all([
      this.em.find(Vehicle, queryFilter, queryOptions),
      this.em.count(Vehicle, queryFilter)
    ])

    const hasMore = offset + vehicles.length < total
    const hasPrevious = !!offset

    return { nodes: vehicles, pageInfo: { total, hasMore, hasPrevious } }
  }
}
