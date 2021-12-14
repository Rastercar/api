import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'JSON Web Token' })
export class JwtModel {
  @Field()
  type!: string

  @Field()
  value!: string
}
