import { OffsetPagination } from '../../../graphql/pagination/offset-pagination'
import { OrderingArgs } from '../../../graphql/pagination/ordering'
import { ObjectQuery } from '@mikro-orm/core'

export interface FindSearchAndPaginateArgs<T> {
  queryFilter: ObjectQuery<T>
  ordering: OrderingArgs
  pagination: OffsetPagination
  search: string
}

export interface PaginableRepository<T> {
  findSearchAndPaginate: (args: FindSearchAndPaginateArgs<T>) => Promise<unknown>
}
