import { CurrentUser } from './decorators/graphql-user.decorator'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { LoginInput, LoginResponse } from './dtos/login.dto'
import { GqlAuthGuard } from './guards/gql-jwt-auth.guard'
import { UserModel } from '../user/user.model'
import { UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(returns => UserModel)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: UserModel) {
    return user
  }

  @Mutation(returns => LoginResponse)
  async login(@Args('input') credentials: LoginInput) {
    const user = await this.authService.validateUserByCredentials(credentials)
    return this.authService.login(user)
  }
}
