import { OffsetPaginated } from '../../graphql/pagination/offset-pagination'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import { trackerModel } from './tracker.constants'

@ObjectType({ description: 'tracker' })
export class TrackerModel {
  @Field(() => Int)
  id!: number

  @Field(() => String)
  model!: trackerModel

  @Field(() => String, { nullable: true, description: 'A human readable identifier, ex: MXT013-BOX-33, Tracker 123 lote 2' })
  identifier!: string | null
}

@ObjectType()
export class OffsetPaginatedTracker extends OffsetPaginated(TrackerModel) {}
