import { CurrentUser } from './decorators/graphql-user.decorator'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { BadRequestException, UseGuards } from '@nestjs/common'
import { LoginInput, LoginResponse } from './dtos/login.dto'
import { GqlAuthGuard } from './guards/gql-jwt-auth.guard'
import { RegisterUserDTO } from './dtos/register-user.dto'
import { ERROR_CODES } from '../../constants/error.codes'
import { UserModel } from '../user/models/user.model'
import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

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
  async login(@Args('credentials') credentials: LoginInput): Promise<LoginResponse> {
    const user = await this.authService.validateUserByCredentials(credentials)
    return this.authService.login(user)
  }

  @Mutation(returns => LoginResponse)
  async register(@Args('user') user: RegisterUserDTO): Promise<LoginResponse> {
    const inUse = await this.authService.checkEmailAddressInUse(user.email)
    if (inUse) throw new BadRequestException(ERROR_CODES.EMAIL_IN_USE)

    const registeredUser = await this.userService.registerUser(user)
    return this.authService.login(registeredUser, { setLastLogin: false })
  }
}
