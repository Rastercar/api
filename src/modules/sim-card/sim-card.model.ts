import { OffsetPaginated } from '../../graphql/pagination/offset-pagination'
import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'sim card' })
export class SimCardModel {
  @Field(() => Int)
  id!: number

  @Field()
  ssn!: string

  @Field()
  phoneNumber!: string

  @Field()
  apnUser!: string

  @Field()
  apnAddress!: string

  @Field()
  apnPassword!: string
}

@ObjectType()
export class OffsetPaginatedSimCard extends OffsetPaginated(SimCardModel) {}
