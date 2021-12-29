import { ValidLoginRequestGuard } from './guards/valid-login-request.guard'
import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { RequestUser } from './decorators/request-user.decorator'
import { GoogleAuthGuard } from './guards/google-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { Profile } from 'passport-google-oauth20'
import { Jwt } from './strategies/jwt.strategy'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { User } from '../user/entities/user.entity'
import { Response } from 'express'
import { UserService } from '../user/user.service'
import { URLSearchParams } from 'url'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  @Post('login')
  @UseGuards(ValidLoginRequestGuard, LocalAuthGuard)
  login(@RequestUser() user: User): Promise<{ user: User; token: Jwt }> {
    return this.authService.login(user)
  }

  /**
   * Redirects the user to the google login page using the google
   * oauth2 passport strategy implemented by the google auth guard
   */
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  redirectToGoogleLoginPage() {}

  /**
   * Handles the redirection after a successfull login with google oauth2,
   * further redirecting to the main pa... TODO: finish me
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async loginWithGoogleProfile(@RequestUser() googleProfile: Profile, @Res() res: Response) {
    const userOrNull = await this.authService.getUserForGoogleProfile(googleProfile.id)

    const PWA_BASE_URL = this.configService.get<string>('PWA_BASE_URL')
    const baseUrl = `${PWA_BASE_URL}/#/`

    if (userOrNull === null) {
      const { uuid } = await this.userService.createOrFindUnregisteredUserForGoogleProfile(googleProfile)
      const query = new URLSearchParams({ finishFor: uuid })

      return res.redirect(`${baseUrl}register?${query.toString()}`)
    }

    const { token } = await this.authService.login(userOrNull)

    const query = new URLSearchParams({ token: token.value })
    return res.redirect(`${baseUrl}login-auto?${query.toString()}`)
  }
}
