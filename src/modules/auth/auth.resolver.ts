import { CurrentUser } from './decorators/graphql-user.decorator'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { LoginInput, LoginResponse } from './dtos/login.dto'
import { GqlAuthGuard } from './guards/gql-jwt-auth.guard'
import { UserModel } from '../user/models/user.model'
import { AuthService } from './auth.service'
import { UseGuards } from '@nestjs/common'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GqlAuthGuard)
  @Query(returns => UserModel)
  me(@CurrentUser() user: UserModel) {
    return user
  }

  @Query(returns => Boolean)
  isEmailInUse(@Args('email', { type: () => String }) email: string) {
    return this.authService.checkEmailAddressInUse(email)
  }

  @Mutation(returns => LoginResponse)
  async login(@Args('input') credentials: LoginInput) {
    const user = await this.authService.validateUserByCredentials(credentials)
    return this.authService.login(user)
  }
}
