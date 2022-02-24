import { ValidLoginRequestGuard } from './guards/valid-login-request.guard'
import { MasterUserService } from '../user/services/master-user.service'
import { Body, Controller, Get, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AuthMailerService } from './services/auth-mailer.service'
import { JwtEmailAuthGuard } from './guards/jwt-email-auth.guard'
import { RequestUser } from './decorators/request-user.decorator'
import { MasterUser } from '../user/entities/master-user.entity'
import { LoginResponse } from './models/login-response.model'
import { GoogleAuthGuard } from './guards/google-auth.guard'
import { UserService } from '../user/services/user.service'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { PWA_ROUTE } from '../../constants/pwa-routes'
import { AuthService } from './services/auth.service'
import { createPwaUrl } from '../mail/mailer.utils'
import { User } from '../user/entities/user.entity'
import { Profile } from 'passport-google-oauth20'
import { Response } from 'express'
import { CheckPasswordDTO } from './dtos/check-password.dto'

@Controller('auth')
export class AuthController {
  constructor(
    readonly authService: AuthService,
    readonly userService: UserService,
    readonly authMailerService: AuthMailerService,
    readonly masterUserService: MasterUserService
  ) {}

  @Get('send-email-address-confirmation-email')
  @UseGuards(JwtAuthGuard)
  sendEmailConfirmation(@RequestUser() user: User | MasterUser) {
    return this.authMailerService.sendEmailAdressConfirmationEmail(user.email)
  }

  @Get('confirm-email-address')
  @UseGuards(JwtEmailAuthGuard)
  async confirmEmailAddress(@RequestUser() user: User | MasterUser) {
    const isRegularUser = user instanceof User

    isRegularUser
      ? await this.userService.updateUser(user, { emailVerified: true })
      : await this.masterUserService.updateMasterUser(user, { emailVerified: true })

    return `Email: ${user.email} for ${isRegularUser ? 'user' : 'master user'}: ${user.id} verified`
  }

  @Post('login')
  @UseGuards(ValidLoginRequestGuard, LocalAuthGuard)
  login(@RequestUser() user: User): Promise<LoginResponse> {
    return this.authService.login(user)
  }

  /**
   * Checks if the password on the request body is the same as the password
   * of the user in the token, this is usefull for validating critical actions
   */
  @Post('check-password')
  @UseGuards(ValidLoginRequestGuard, LocalAuthGuard)
  async checckPassword(@RequestUser('password') userPass: string, @Body() dto: CheckPasswordDTO) {
    const isValid = await this.authService.comparePasswords(dto.password, userPass)
    if (!isValid) throw new UnauthorizedException('Invalid password')

    return 'ok'
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
   * redirecting to the registration page if a the oauthprofile does not
   * contain a user or to a auto-login page otherwise
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async loginWithGoogleProfile(@RequestUser() googleProfile: Profile, @Res() res: Response) {
    const userOrNull = await this.authService.getUserForGoogleProfile(googleProfile.id)

    if (!userOrNull) {
      const { uuid } = await this.userService.createOrFindUnregisteredUserForGoogleProfile(googleProfile)
      const url = createPwaUrl(PWA_ROUTE.REGISTER, { finishFor: uuid })

      return res.redirect(url)
    }

    const { token } = await this.authService.login(userOrNull, { tokenOptions: { expiresIn: '60s' } })
    const url = createPwaUrl(PWA_ROUTE.AUTO_LOGIN, { token: token.value })

    return res.redirect(url)
  }
}
