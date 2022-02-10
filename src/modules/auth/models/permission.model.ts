import { Field, Int, ObjectType } from '@nestjs/graphql'
import { is } from '../../../utils/coverage-helpers'

@ObjectType({ description: 'Permissions used by access level' })
export class Permission {
  @Field(is(Int))
  id!: number

  @Field()
  name!: string

  @Field()
  description!: string
}
