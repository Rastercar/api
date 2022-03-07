import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'organization' })
export class OrganizationModel {
  @Field(type => Int)
  id!: number

  @Field()
  name!: string

  @Field()
  blocked!: boolean

  @Field()
  billing_email!: string

  @Field()
  billing_email_verified!: boolean
}
