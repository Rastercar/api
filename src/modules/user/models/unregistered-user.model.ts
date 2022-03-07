import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'unregistered user' })
export class UnregisteredUserModel {
  @Field()
  uuid!: string

  @Field(() => String, { nullable: true })
  username!: string | null

  @Field(() => String, { nullable: true })
  email!: string | null

  @Field()
  emailVerified!: boolean
}
