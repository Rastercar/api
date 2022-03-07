import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'tracker' })
export class TrackerModel {
  @Field(() => Int)
  id!: number

  @Field()
  model!: string
}
