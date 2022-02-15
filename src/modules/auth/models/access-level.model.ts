import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'
import { PERMISSION } from '../constants/permissions'
import { is } from '../../../utils/coverage-helpers'

registerEnumType(PERMISSION, { name: 'PERMISSION' })

@ObjectType({ description: 'The access level to the tracked dashboard' })
export class AccessLevelModel {
  @Field(is(Int))
  id!: number

  @Field()
  name!: string

  @Field()
  description!: string

  @Field(() => [PERMISSION])
  permissions!: PERMISSION[]
}
