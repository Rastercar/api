import { getOrderingClause, OrderingArgs } from '../../graphql/pagination/ordering'
import { OffsetPaginatedVehicle, VEHICLE_ORDERABLE_FIELDS } from './vehicle.model'
import { OffsetPagination } from '../../graphql/pagination/offset-pagination'
import { BaseRepository } from '../../database/postgres/base/base-repository'
import { ObjectQuery } from '@mikro-orm/core'
import { Vehicle } from './vehicle.entity'

interface FindSearchAndPaginateArgs {
  queryFilter: ObjectQuery<Vehicle>
  ordering: OrderingArgs
  pagination: OffsetPagination
  search: string
}

export class VehicleRepository extends BaseRepository<Vehicle> {
  /**
   * Finds a vehi
   */
  findSearchAndPaginate({ queryFilter, ordering, pagination, search }: FindSearchAndPaginateArgs): Promise<OffsetPaginatedVehicle> {
    const { limit, offset } = pagination

    if (search) queryFilter.plate = { $ilike: `${search}%` }

    const queryOptions = getOrderingClause<Vehicle>(ordering, VEHICLE_ORDERABLE_FIELDS)

    return this.findAndOffsetPaginate({ limit, offset, queryOptions, queryFilter })
  }
}
