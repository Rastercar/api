import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql'
import { IsInt } from 'class-validator'
import { Type } from '@nestjs/common'

@ArgsType()
export class OffsetPagination {
  @Field(() => Int)
  @IsInt()
  offset = 0

  @Field(() => Int)
  @IsInt()
  limit = 10
}

@ObjectType()
class OffsetPageInfo {
  @Field(() => Int, { description: 'Quantity of all avaliable records' })
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
    @Field(() => [classRef], { nullable: true })
    nodes!: T[]

    @Field(() => OffsetPageInfo)
    pageInfo!: OffsetPageInfo
  }

  return PaginatedType as Type<IOffsetPaginatedType<T>>
}
