import { PaginableRepository, FindSearchAndPaginateArgs } from '../../database/postgres/interfaces/paginable-repository'
import { OffsetPaginatedSimCard, SIM_CARD_ORDERABLE_FIELDS } from './sim-card.model'
import { BaseRepository } from '../../database/postgres/base/base-repository'
import { getOrderingClause } from '../../graphql/pagination/ordering'
import { SimCard } from './sim-card.entity'

export class SimCardRepository extends BaseRepository<SimCard> implements PaginableRepository<SimCard> {
  findSearchAndPaginate({
    queryFilter,
    ordering,
    pagination,
    search
  }: FindSearchAndPaginateArgs<SimCard>): Promise<OffsetPaginatedSimCard> {
    const { limit, offset } = pagination

    if (search) queryFilter.phoneNumber = { $ilike: `%${search}%` }

    const queryOptions = getOrderingClause<SimCard>(ordering, SIM_CARD_ORDERABLE_FIELDS)

    return this.findAndOffsetPaginate({ limit, offset, queryOptions, queryFilter })
  }
}
