import { MasterAccessLevelModel } from '../../auth/models/master-access-level.model'
import { AccessLevelModel } from '../../auth/models/access-level.model'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import { is } from '../../../utils/coverage-helpers'

@ObjectType({ description: 'master user (a user with access to the main panel' })
export class MasterUserModel {
  @Field(is(Int))
  id!: number

  @Field()
  username!: string

  @Field()
  email!: string

  @Field()
  emailVerified!: boolean

  @Field(is(AccessLevelModel))
  accessLevel!: AccessLevelModel

  @Field(is(MasterAccessLevelModel))
  masterAccessLevel!: MasterAccessLevelModel
}
