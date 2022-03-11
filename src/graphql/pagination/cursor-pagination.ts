import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql'
import { is } from '../../utils/coverage-helpers'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { RequiredProps } from '../../validators/require-other-prop.validator'
import { IncompatableWith } from '../../validators/incompatible-with.validator'

const b64Encode = (x: string) => Buffer.from(x).toString('base64')
const b64Decode = (x: string) => Buffer.from(x, 'base64').toString()

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
  @Transform(({ value }) => b64Decode(value || '0'), { toPlainOnly: true })
  after!: string

  @Field(is(Int), { description: 'Return the last N elements from the list' })
  @IncompatableWith(['first'])
  @IsOptional()
  @IsInt()
  @Min(0)
  @RequiredProps([{ prop: 'before' }])
  last = 10

  @Field(is(String), { nullable: true, description: 'Return the elements in the list before this cursor' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => b64Decode(value || '0'), { toPlainOnly: true })
  before!: string
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

/**
 * Creates forward pagination from a pagination config its retrieved rows
 *
 * **NOTE:** There are 2 main assumptions about the rows passed here.
 *
 * - The amount of rows queried was `pagination.first + 1`
 * - The entities in rows have an id attribute
 */
export function createForwardPagination<T>(opts: { pagination: CursorPagination; rows: T[]; cursorKey: keyof T }): ICursorPaginatedType<T> {
  const { pagination, rows, cursorKey } = opts

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

  const startCursor = b64Encode(`${first?.[cursorKey] || 0}`)
  const endCursor = hasNextPage ? b64Encode(`${last?.[cursorKey] || 0}`) : b64Encode('0')

  const edges = rows.map(u => ({ node: u, cursor: b64Encode(`${u[cursorKey]}`) }))

  return { edges, nodes: rows, pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor } }
}
