import { Type } from '@nestjs/common'
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsInt } from 'class-validator'

@InputType()
export class OffsetPagination {
  @Field(type => Int)
  @IsInt()
  offset: number = 0

  @Field(type => Int)
  @IsInt()
  limit: number = 10
}

@ObjectType()
class OffsetPageInfo {
  @Field(type => Int, { description: 'Quantity of all avaliable records' })
  total!: number

  @Field({ description: 'If you can increase the offset to fetch next records' })
  hasMore!: boolean

  @Field({ description: 'If you can decrease the offset to fetch previous records' })
  hasPrevious!: boolean
}

export interface IOffsetPaginatedType<T> {
  nodes: T[]

  pageInfo: {
    total: number
    hasMore: boolean
    hasPrevious: boolean
  }
}

/**
 * Creates a offset pagination object type for a class
 */
export function OffsetPaginated<T>(classRef: Type<T>): Type<IOffsetPaginatedType<T>> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IOffsetPaginatedType<T> {
    @Field(type => [classRef], { nullable: true })
    nodes!: T[]

    @Field(type => OffsetPageInfo)
    pageInfo!: OffsetPageInfo
  }

  return PaginatedType as Type<IOffsetPaginatedType<T>>
}
