import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'
import { MASTER_PERMISSION } from '../constants/permissions'
import { is } from '../../../utils/coverage-helpers'

registerEnumType(MASTER_PERMISSION, { name: 'MASTER_PERMISSION' })

@ObjectType({ description: 'The access level to the tracker dashboard' })
export class MasterAccessLevelModel {
  @Field(is(Int))
  id!: number

  @Field()
  name!: string

  @Field()
  description!: string

  @Field(() => [MASTER_PERMISSION])
  permissions!: MASTER_PERMISSION[]
}
