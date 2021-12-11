import { CurrentUser } from './decorators/graphql-user.decorator'
import { GqlAuthGuard } from './guards/gql-jwt-auth.guard'
import { Query, Resolver } from '@nestjs/graphql'
import { UserModel } from '../user/user.model'
import { UseGuards } from '@nestjs/common'

@Resolver()
export class AuthResolver {
  @Query(returns => UserModel)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: UserModel) {
    return user
  }
}
