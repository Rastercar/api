import { OrganizationModel } from '../../organization/models/organization.model'
import { AccessLevelModel } from '../../auth/models/access-level.model'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import { is } from '../../../utils/coverage-helpers'

@ObjectType({ description: 'user' })
export class UserModel {
  @Field(is(Int))
  id!: number

  @Field()
  username!: string

  @Field()
  email!: string

  @Field()
  emailVerified!: boolean

  @Field(() => String, { nullable: true })
  googleProfileId!: string | null

  @Field(is(OrganizationModel))
  organization!: OrganizationModel

  @Field(is(AccessLevelModel))
  accessLevel!: AccessLevelModel
}
