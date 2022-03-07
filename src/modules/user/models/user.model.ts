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
}
