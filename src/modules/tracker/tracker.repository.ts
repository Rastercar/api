import { FindSearchAndPaginateArgs, PaginableRepository } from '../../database/postgres/interfaces/paginable-repository'
import { OffsetPaginatedTracker, TRACKER_ORDERABLE_FIELDS } from './tracker.model'
import { BaseRepository } from '../../database/postgres/base/base-repository'
import { getOrderingClause } from '../../graphql/pagination/ordering'
import { Tracker } from './tracker.entity'

export class TrackerRepository extends BaseRepository<Tracker> implements PaginableRepository<Tracker> {
  findSearchAndPaginate({
    queryFilter,
    pagination,
    ordering,
    search
  }: FindSearchAndPaginateArgs<Tracker>): Promise<OffsetPaginatedTracker> {
    const { limit, offset } = pagination

    if (search) {
      queryFilter.$or = [{ identifier: { $ilike: `%${search}%` } }, { model: { $ilike: `%${search}%` } }]
    }

    const queryOptions = getOrderingClause<Tracker>(ordering, TRACKER_ORDERABLE_FIELDS)

    return this.findAndOffsetPaginate({ limit, offset, queryOptions, queryFilter })
  }

  /**
   * Get all trackers that have at least one sim card installed
   */
  allActiveTrackersForOrganization(organizationId: number) {
    return this.qb('tracker')
      .select('*')
      .joinAndSelect('tracker.simCards', 'cards')
      .where({ 'tracker.organization_id': organizationId })
      .getResultList()
  }
}
