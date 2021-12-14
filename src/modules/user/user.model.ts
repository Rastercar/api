import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'user' })
export class UserModel {
  @Field(type => ID)
  id!: number

  @Field()
  username!: string

  @Field()
  email!: string

  @Field()
  emailVerified!: boolean

  @Field({ nullable: true })
  googleProfileId?: string
}
