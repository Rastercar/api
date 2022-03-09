import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { is } from '../utils/coverage-helpers'
import { IsInt, Min } from 'class-validator'
import { Type } from '@nestjs/common'

@InputType()
export class ForwardPagination {
  @Field(is(Int), { description: 'Return the first N elements from the list' })
  @IsInt()
  @Min(0)
  first: number = 10

  @Field(is(Int), { description: 'Return the elements in the list after this cursor' })
  @IsInt()
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

  @ObjectType('PageInfo')
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
