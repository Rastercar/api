import { Field, Int, ObjectType } from '@nestjs/graphql'
import { is } from '../../../utils/coverage-helpers'
import { OrganizationModel } from '../../organization/models/organization.model'

@ObjectType({ description: 'user' })
export class UserModel {
  @Field(type => Int)
  id!: number

  @Field()
  username!: string

  @Field()
  email!: string

  @Field()
  emailVerified!: boolean

  @Field({ nullable: true })
  googleProfileId?: string

  @Field(is(OrganizationModel))
  organization!: OrganizationModel
}
