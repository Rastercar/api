import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { is } from '../../utils/coverage-helpers'
import { IsInt, Min } from 'class-validator'
import { Type } from '@nestjs/common'

@InputType()
export class ForwardPagination {
  @Field(is(Int), { description: 'Return the first N elements from the list' })
  @IsInt()
  @Min(0)
  first: number = 10

  @Field(is(Int), { nullable: true, description: 'Return the elements in the list after this cursor' })
  @IsInt()
  @Min(0)
  after: number = 0
}

@InputType()
export class BackwardPagination {
  @Field(is(Int), { description: 'Return the last N elements from the list' })
  @IsInt()
  @Min(0)
  last: number = 10

  @Field(is(Int), { description: 'Return the elements in the list before this cursor' })
  @IsInt()
  before!: number
}

@ObjectType()
abstract class PageInfo {
  @Field({ description: 'When paginating forwards, are there more items?' })
  hasNextPage!: boolean

  @Field({ description: 'When paginating backwards, are there more items?' })
  hasPreviousPage!: boolean

  @Field({ description: 'When paginating backwards, the cursor to continue' })
  startCursor!: string

  @Field({ description: 'When paginating forwards, the cursor to continue' })
  endCursor!: string
}

interface IEdgeType<T> {
  cursor: string
  node: T
}

export interface IPaginatedType<T> {
  edges: IEdgeType<T>[]

  nodes: T[]

  totalCount?: number

  pageInfo: {
    startCursor: string
    endCursor: string
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * Creates a pagination object type for a class, compliante with the spec:
 *
 * https://relay.dev/graphql/connections.htm
 */
export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Connection`)
  abstract class EdgeType {
    @Field(type => classRef)
    node!: T

    @Field(type => String)
    cursor!: string
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field(type => [EdgeType], { nullable: true })
    edges!: EdgeType[]

    @Field(type => [classRef], { nullable: true })
    nodes!: T[]

    @Field(type => PageInfo)
    pageInfo!: PageInfo
  }

  return PaginatedType as Type<IPaginatedType<T>>
}

/**
 * Creates forward pagination from a pagination config its retrieved rows
 *
 * **NOTE:** There are 2 main assumptions about the rows passed here.
 *
 * - The amount of rows queried was `pagination.first + 1`
 * - The entities in rows have an id attribute
 */
export function createForwardPagination<T extends { id: number }>(opts: { pagination: ForwardPagination; rows: T[] }): IPaginatedType<T> {
  const { pagination, rows } = opts

  const first: typeof rows[number] | undefined = rows[0]

  // if asked for first 10
  // we assumed rows were queried with limit 11
  // last element that should be included is at rows.length - 1

  const last: typeof rows[number] | undefined = rows[rows.length - 1]

  // If the pagination asked for 20 rows, we query 21, if 21 were retrieved then there is a next page
  const hasNextPage = rows.length === pagination.first + 1

  // If we have one more user than we requested remove it
  if (hasNextPage) rows.pop()

  // We do not have a previous page if we didnt specify a cursor, therefore we are at page 1
  // ..
  // yes it is possible that a user might query specifiying the first result of a list and as the
  // cursor meaning we would say there is a previous page when there is not but we cant predict
  // this and even github has this 'buggy' behavior so i guess its not the end of the world
  // ..
  // (and only a mentaly ill user would query something with the first node as the cursor)
  const hasPreviousPage = !!pagination.after

  const startCursor = `${first?.id || 0}`
  const endCursor = hasNextPage ? `${last?.id || 0}` : '0'

  const edges = rows.map(u => ({ node: u, cursor: Buffer.from(`${u.id}`).toString('base64') }))

  if (!hasPreviousPage && edges[0]) edges[0].cursor = Buffer.from('0').toString('base64')

  return {
    edges,
    nodes: rows,
    pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor }
  }
}
