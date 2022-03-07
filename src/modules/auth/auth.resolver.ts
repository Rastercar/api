import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { is, returns } from '../../utils/coverage-helpers'
import { UserService } from '../user/services/user.service'
import { LoginInput } from './dtos/login.dto'
import { RegisterUserDTO } from './dtos/register-user.dto'
import { LoginResponse } from './models/login-response.model'
import { AuthService } from './services/auth.service'

@Resolver()
export class AuthResolver {
  constructor(readonly authService: AuthService, readonly userService: UserService) {}

  @Query(returns(Boolean))
  isEmailInUse(@Args('email', { type: is(String) }) email: string) {
    return this.authService.checkEmailAddressInUse(email)
  }

  @Mutation(returns(LoginResponse))
  async login(@Args('credentials') credentials: LoginInput): Promise<LoginResponse> {
    const user = await this.authService.validateUserByCredentials(credentials)
    return this.authService.login(user)
  }

  @Mutation(returns(LoginResponse))
  loginWithToken(@Args('token', { type: is(String) }) token: string): Promise<LoginResponse> {
    return this.authService.loginWithToken(token)
  }

  @Mutation(returns(LoginResponse))
  async register(@Args('user') user: RegisterUserDTO): Promise<LoginResponse> {
    const registeredUser = await this.userService.registerUser(user)
    return this.authService.login(registeredUser, { setLastLogin: false })
  }
}
