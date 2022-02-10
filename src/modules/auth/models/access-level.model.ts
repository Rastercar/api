import { Field, Int, ObjectType } from '@nestjs/graphql'
import { is } from '../../../utils/coverage-helpers'

@ObjectType({ description: 'The access level to the tracked dashboard' })
export class AccessLevelModel {
  @Field(is(Int))
  id!: number

  @Field()
  name!: string

  @Field()
  description!: string
}
