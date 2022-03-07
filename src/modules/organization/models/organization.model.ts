import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'organization' })
export class OrganizationModel {
  @Field(() => Int)
  id!: number

  @Field()
  name!: string

  @Field()
  blocked!: boolean

  @Field()
  billingEmail!: string

  @Field()
  billingEmailVerified!: boolean
}
