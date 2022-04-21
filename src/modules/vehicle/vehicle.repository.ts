import { BaseRepository } from '../../database/postgres/base/base-repository'
import { FindSearchAndPaginateArgs, PaginableRepository } from '../../database/postgres/interfaces/paginable-repository'
import { getOrderingClause } from '../../graphql/pagination/ordering'
import { Vehicle } from './vehicle.entity'
import { OffsetPaginatedVehicle, VEHICLE_ORDERABLE_FIELDS } from './vehicle.model'

export class VehicleRepository extends BaseRepository<Vehicle> implements PaginableRepository<Vehicle> {
  findSearchAndPaginate({
    queryFilter,
    ordering,
    pagination,
    search
  }: FindSearchAndPaginateArgs<Vehicle>): Promise<OffsetPaginatedVehicle> {
    const { limit, offset } = pagination

    if (search) queryFilter.plate = { $ilike: `${search}%` }

    const queryOptions = getOrderingClause<Vehicle>(ordering, VEHICLE_ORDERABLE_FIELDS)

    return this.findAndOffsetPaginate({ limit, offset, queryOptions, queryFilter })
  }
}
