import { OffsetPaginated } from '../../graphql/pagination/offset-pagination'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import { SimCard } from './sim-card.entity'

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

export const SIM_CARD_ORDERABLE_FIELDS: (keyof SimCard)[] = ['id', 'apnAddress', 'apnUser', 'apnPassword', 'phoneNumber']
