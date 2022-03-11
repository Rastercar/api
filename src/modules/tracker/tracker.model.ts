import { Field, Int, ObjectType } from '@nestjs/graphql'
import { OffsetPaginated } from '../../graphql/pagination/offset-pagination'

@ObjectType({ description: 'tracker' })
export class TrackerModel {
  @Field(() => Int)
  id!: number

  @Field()
  model!: string
}

@ObjectType()
export class OffsetPaginatedTracker extends OffsetPaginated(TrackerModel) {}
