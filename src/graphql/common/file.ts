import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class File {
  @Field()
  uri!: string

  @Field()
  filename!: string

  @Field()
  mimetype!: string

  @Field()
  encoding!: string
}
