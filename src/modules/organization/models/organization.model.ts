import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'organization but without nested fields' })
export class SimpleOrganizationModel {
  @Field(type => Int)
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

@ObjectType({ description: 'organization' })
export class OrganizationModel extends SimpleOrganizationModel {}
