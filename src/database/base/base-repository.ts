import { FindOptions, ObjectQuery } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/postgresql'
import { createForwardPagination, CursorPagination, ICursorPaginatedType } from '../../graphql/pagination/cursor-pagination'
import { IOffsetPaginatedType } from '../../graphql/pagination/offset-pagination'

interface FindAndOffsetPaginateArgs<T> {
  queryFilter?: ObjectQuery<T>
  queryOptions?: FindOptions<T>
  limit: number
  offset: number
}

interface FindAndCursorPaginateArgs<T> {
  queryFilter?: ObjectQuery<T>
  pagination: CursorPagination
  cursorKey: keyof T
}

export class BaseRepository<T> extends EntityRepository<T> {
  /**
   * Finds and counts all entities on the query filter, then paginate the result
   */
  async findAndOffsetPaginate(args: FindAndOffsetPaginateArgs<T> = { limit: 100, offset: 0 }): Promise<IOffsetPaginatedType<T>> {
    const { queryFilter, queryOptions, limit, offset } = args

    const options = { ...queryOptions, limit, offset }
    const getRowsQuery = queryFilter ? this.find(queryFilter, options) : this.findAll(options)

    const [total, nodes] = await Promise.all([this.count(queryFilter), getRowsQuery])

    const hasMore = offset + nodes.length < total
    const hasPrevious = !!offset

    return { nodes, pageInfo: { total, hasMore, hasPrevious } }
  }

  /**
   * Finds and wraps all rows in a cursor pagination object spec:
   *
   * @see https://relay.dev/graphql/connections.htm
   *
   * @param options.cursorKey - The column used as the cursor and to order rows by
   */
  async findAndCursorPaginate({ pagination, cursorKey, queryFilter }: FindAndCursorPaginateArgs<T>): Promise<ICursorPaginatedType<T>> {
    const { after, before, first, last } = pagination

    // prettier-ignore
    const opts = !!before
      ? { [cursorKey]: { $lt: before } } 
      : { [cursorKey]: { $gt: after } }

    const filter = { ...queryFilter, ...opts }

    const rows = await this.find(filter as any, {
      orderBy: [{ [cursorKey]: 'ASC' }],
      limit: !!before ? last + 2 : first + 1
    })

    return createForwardPagination({ pagination, rows, cursorKey })
  }
}
