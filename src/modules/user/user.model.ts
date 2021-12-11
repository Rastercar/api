import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'user' })
export class UserModel {
  @Field(type => ID)
  id!: number

  @Field()
  username!: string
}
