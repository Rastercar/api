import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'
import { is } from '../../utils/coverage-helpers'
import { Transform } from 'class-transformer'
import { Type } from '@nestjs/common'

const b64Encode = (x: string) => Buffer.from(x).toString('base64')
const b64Decode = (x: string) => Buffer.from(x, 'base64').toString()

const decodeIfNotNill = ({ value }) => (typeof value === 'string' && !!value ? b64Decode(value) : undefined)

@ArgsType()
export class CursorPagination {
  @Field(is(Int), { description: 'Return the first N elements from the list' })
  @IsInt()
  @Min(0)
  @IsOptional()
  first = 10

  @Field(is(String), { nullable: true, description: 'Return the elements in the list after this cursor' })
  @IsString()
  @IsOptional()
  @Transform(decodeIfNotNill, { toPlainOnly: true })
  after?: string

  @Field(is(Int), { description: 'Return the last N elements from the list' })
  @IsOptional()
  @IsInt()
  @Min(0)
  last = 10

  @Field(is(String), { nullable: true, description: 'Return the elements in the list before this cursor' })
  @IsString()
  @IsOptional()
  @Transform(decodeIfNotNill, { toPlainOnly: true })
  before?: string
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

export interface ICursorPaginatedType<T> {
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
export function CursorPaginated<T>(classRef: Type<T>): Type<ICursorPaginatedType<T>> {
  @ObjectType(`${classRef.name}Connection`)
  abstract class EdgeType {
    @Field(() => classRef)
    node!: T

    @Field(() => String)
    cursor!: string
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements ICursorPaginatedType<T> {
    @Field(() => [EdgeType], { nullable: true })
    edges!: EdgeType[]

    @Field(() => [classRef], { nullable: true })
    nodes!: T[]

    @Field(() => PageInfo)
    pageInfo!: PageInfo
  }

  return PaginatedType as Type<ICursorPaginatedType<T>>
}

export function createPagination<T>(opts: { pagination: CursorPagination; rows: T[]; cursorKey: keyof T }): ICursorPaginatedType<T> {
  const { pagination, rows, cursorKey } = opts

  const isForwardPagination = !pagination.before

  // https://relay.dev/graphql/connections.htm#sec-Edge-order
  if (!isForwardPagination) rows.reverse()

  const firstRow: typeof rows[number] | undefined = rows[0]

  // if asked for first 10
  // we assumed rows were queried with limit 11
  // last element that should be included is at rows.length - 1

  const lastRow: typeof rows[number] | undefined = rows[rows.length - 1]

  // If the pagination asked for 20 rows, we query 21, if 21 were retrieved then there is a next page
  const hasNextPage = isForwardPagination ? rows.length === pagination.first + 1 : rows.length === pagination.last + 1

  // If we have one more user than we requested remove it
  if (hasNextPage) isForwardPagination ? rows.pop() : rows.shift()

  // We do not have a previous page if we didnt specify a cursor
  // ..
  // yes it is possible that a user might query specifiying the first result of a list while
  // forward paginating and the last while backwards paginating and as the cursor exists we
  // falsely return there is a previous/next page when there is not but we cant predict
  // this and even github has this 'buggy' behavior so i guess its not the end of the world
  const hasPreviousPage = isForwardPagination ? !!pagination.after : !!pagination.before

  const startCursor = b64Encode(`${firstRow?.[cursorKey] || 0}`)
  const endCursor = hasNextPage ? b64Encode(`${lastRow?.[cursorKey] || 0}`) : b64Encode('0')

  const edges = rows.map(u => ({ node: u, cursor: b64Encode(`${u[cursorKey]}`) }))

  return { edges, nodes: rows, pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor } }
}
