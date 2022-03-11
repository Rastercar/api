import { CursorPaginated } from '../../../graphql/pagination/cursor-pagination'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import { is } from '../../../utils/coverage-helpers'

@ObjectType()
export class BaseUserModel {
  @Field(is(Int))
  id!: number

  @Field()
  username!: string

  @Field()
  email!: string

  @Field()
  emailVerified!: boolean
}

@ObjectType({ description: 'user' })
export class UserModel extends BaseUserModel {
  @Field(() => String, { nullable: true })
  googleProfileId!: string | null
}

@ObjectType()
export class CursorPaginatedUser extends CursorPaginated(UserModel) {}
