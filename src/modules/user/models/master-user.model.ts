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
  email_verified!: boolean
}
