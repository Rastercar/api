import { Field, Int, ObjectType } from '@nestjs/graphql'
import { OffsetPaginated } from '../../graphql/pagination/offset-pagination'
import { trackerModel } from './tracker.constants'
import { Tracker } from './tracker.entity'

@ObjectType({ description: 'tracker' })
export class TrackerModel {
  @Field(() => Int)
  id!: number

  @Field(() => String)
  model!: trackerModel

  @Field(() => String, { description: 'A human readable identifier, ex: MXT013-BOX-33, Tracker 123 lote 2' })
  identifier!: string
}

@ObjectType()
export class OffsetPaginatedTracker extends OffsetPaginated(TrackerModel) {}

export const TRACKER_ORDERABLE_FIELDS: (keyof Tracker)[] = ['id', 'identifier', 'model']
