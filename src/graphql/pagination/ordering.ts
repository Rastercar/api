import { FindOptions, QueryOrderMap } from '@mikro-orm/core'
import { ArgsType, Field } from '@nestjs/graphql'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

@ArgsType()
export class OrderingArgs {
  @Field(() => String, { description: 'The field to order results by. example: name, id', nullable: true })
  @IsString()
  @IsOptional()
  orderBy!: string | null

  @Field(() => Boolean, { description: 'If the records should be sorted in descending order by the field on "orderBy"' })
  @IsBoolean()
  descending = false
}

// prettier-ignore
export function getOrderingClause<T>({ orderBy, descending }: OrderingArgs, allowedValues: (keyof T)[]): FindOptions<T> {
  return orderBy && allowedValues.includes(orderBy as keyof T) 
    ? { orderBy: { [orderBy]: descending ? 'DESC' : 'ASC' } } as QueryOrderMap<T>
    : {}
}
