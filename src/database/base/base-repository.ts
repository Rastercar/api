import { createPagination, ICursorPaginatedType, CursorPagination } from '../../graphql/pagination/cursor-pagination'
import { IOffsetPaginatedType } from '../../graphql/pagination/offset-pagination'
import { FindOptions, ObjectQuery } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/postgresql'

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
  cursorType?: 'number' | 'string'
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
   * @param options.cursorType - The typeof the cursor, if numeric will cast the cursors to a int before querying
   */
  async findAndCursorPaginate(options: FindAndCursorPaginateArgs<T>): Promise<ICursorPaginatedType<T>> {
    const { pagination, queryFilter, cursorKey, cursorType = 'number' } = options
    const { first, last, after: a, before: b } = pagination

    let after: string | number | undefined = a
    let before: string | number | undefined = b

    const isForwardPagination = !before

    if (cursorType === 'number') {
      after = parseInt(a || '0')
      before = parseInt(b || '0')
    }

    // prettier-ignore
    const opts = isForwardPagination
      ? { [cursorKey]: { $gt: after } }
      : { [cursorKey]: { $lt: before } }

    const filter = { ...queryFilter, ...opts }

    const rows = await this.find(filter as any, {
      orderBy: [{ [cursorKey]: isForwardPagination ? 'ASC' : 'DESC' }],
      limit: isForwardPagination ? first + 1 : last + 1
    })

    return createPagination({ pagination, rows, cursorKey })
  }
}
