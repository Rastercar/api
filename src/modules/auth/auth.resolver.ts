import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { LoginResponse } from './models/login-response.model'
import { UserService } from '../user/services/user.service'
import { RegisterUserDTO } from './dtos/register-user.dto'
import { is, returns } from '../../utils/coverage-helpers'
import { ERROR_CODES } from '../../constants/error.codes'
import { BadRequestException } from '@nestjs/common'
import { LoginInput } from './dtos/login.dto'
import { AuthService } from './auth.service'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

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
    const inUse = await this.authService.checkEmailAddressInUse(user.email)
    if (inUse) throw new BadRequestException(ERROR_CODES.EMAIL_IN_USE)

    const registeredUser = await this.userService.registerUser(user)
    return this.authService.login(registeredUser, { setLastLogin: false })
  }
}
