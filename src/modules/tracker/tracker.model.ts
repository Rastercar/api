import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'tracker' })
export class TrackerModel {
  @Field(type => Int)
  id!: number

  @Field()
  model!: string
}
