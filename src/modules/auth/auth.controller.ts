import { Body, Controller, Get, NotFoundException, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { MasterUser, User } from '@prisma/client'
import { Request, Response } from 'express'
import { Profile } from 'passport-google-oauth20'

import { PWA_ROUTE } from '../../constants/pwa-routes'
import { createPwaUrl } from '../mail/mailer.utils'
import { ChangePasswordDTO } from '../user/dtos/change-password.dto'
import { MasterUserService } from '../user/services/master-user.service'
import { UserService } from '../user/services/user.service'
import { isMasterUser } from '../user/user.utils'
import { RequestUser } from './decorators/request-user.decorator'
import { CheckPasswordDTO } from './dtos/check-password.dto'
import { ForgotPasswordDTO } from './dtos/forgot-password.dto'
import { GoogleAuthGuard } from './guards/google-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { ValidLoginRequestGuard } from './guards/valid-login-request.guard'
import { LoginResponse } from './models/login-response.model'
import { AuthMailerService } from './services/auth-mailer.service'
import { AuthTokenService } from './services/auth-token.service'
import { AuthService } from './services/auth.service'

@Controller('auth')
export class AuthController {
  constructor(
    readonly authService: AuthService,
    readonly userService: UserService,
    readonly authTokenService: AuthTokenService,
    readonly authMailerService: AuthMailerService,
    readonly masterUserService: MasterUserService
  ) {}

  /**
   * Requests a email address confirmation email to be sent to the request user,
   * the email contains a token to be used by the 'confirm-email-address' route
   */
  @Get('send-email-address-confirmation-email')
  @UseGuards(JwtAuthGuard)
  sendEmailConfirmation(@RequestUser() user: User | MasterUser) {
    return this.authMailerService.sendEmailAdressConfirmationEmail(user.email)
  }

  /**
   * Sends a `forgot pasword email` to the email address if it belongs to a user
   */
  @Post('send-forgot-password-email')
  async sendForgotPasswordEmail(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    const user = await this.authTokenService.getUserOrMasterUserByEmail(forgotPasswordDto.email)
    if (!user) throw new NotFoundException(`User not found with email ${forgotPasswordDto.email}`)

    const token = await this.authService.setUserResetPasswordToken(user)

    return this.authMailerService.sendForgotPasswordEmail(user, token)
  }

  /**
   * Changes the password of the user in the dto token
   */
  @Post('reset-password')
  async changeRequestUserPassword(@Body() dto: ChangePasswordDTO): Promise<string> {
    await this.authService.resetUserPasswordByToken(dto)
    return 'Password change successfull'
  }

  /**
   * Confirms the email adress of the user found by the JwtEmailAuthGuard
   */
  @Get('confirm-email-address')
  @UseGuards(JwtAuthGuard)
  async confirmEmailAddress(@RequestUser() user: User | MasterUser) {
    const isRegularUser = !isMasterUser(user)

    // TODO create type guard for diffing users and master_users
    isRegularUser
      ? await this.userService.updateUser(user, { emailVerified: true })
      : await this.masterUserService.updateMasterUser(user, { emailVerified: true })

    return `Email: ${user.email} for ${isRegularUser ? 'user' : 'master user'}: ${user.id} verified`
  }

  /**
   * Email/password based login
   */
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
  @UseGuards(JwtAuthGuard)
  async checkPassword(@RequestUser('password') userPass: string, @Body() dto: CheckPasswordDTO): Promise<boolean> {
    return this.authService.comparePasswords(dto.password, userPass)
  }

  /**
   * Redirects the user to the google login page using the google
   * oauth2 passport strategy implemented by the google auth guard
   */
  @Get('google/authenticate')
  @UseGuards(GoogleAuthGuard)
  authenticate() {
    //
  }

  /**
   * Handles the redirection after a successfull authentification with google oauth2.
   *
   * If the request `query.state` contains a user token then we try to link/associate
   * the user in it with the google profile
   *
   * Else if the google profile already is associated with a user then we just redirect
   * the request to the PWA auto-login page
   *
   * Else we create a unregistered user for the profile and redirect to the PWA
   * registration page
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleOauthCallback(@RequestUser() googleProfile: Profile, @Res() res: Response, @Req() { query }: Request) {
    const userWithGoogleProfile = await this.userService.getUserForGoogleProfile(googleProfile.id)

    const shouldLinkExistingUserAccount = typeof query.state === 'string' && query.state

    if (shouldLinkExistingUserAccount) {
      const tokenPayload = await this.authTokenService.validateAndDecodeToken(query.state as string)
      const userToLinkAccountFor = await this.authTokenService.getUserFromDecodedTokenOrFail(tokenPayload)

      if (isMasterUser(userToLinkAccountFor)) throw new UnauthorizedException('Master users cannot use oauth services')

      if (userToLinkAccountFor.googleProfileId) {
        throw new UnauthorizedException(`User ${userToLinkAccountFor.id} already linked to a google account, unlink it first`)
      }

      if (userWithGoogleProfile) {
        throw new UnauthorizedException('Cannot link 2 users to a google profile / google profile in use by another user')
      }

      await this.userService.updateUser(userToLinkAccountFor, { googleProfileId: googleProfile.id })

      const url = createPwaUrl(PWA_ROUTE.SUCESSO_OAUTH)

      return res.redirect(url)
    }

    if (!userWithGoogleProfile) {
      const { uuid } = await this.userService.createOrFindUnregisteredUserForGoogleProfile(googleProfile)
      const url = createPwaUrl(PWA_ROUTE.REGISTER, { finishFor: uuid })

      return res.redirect(url)
    }

    const token = await this.authService.setUserAutoLoginToken(userWithGoogleProfile)

    // NOTE: Sice the autologin token is really short lived, only usable once,
    // can only be used to in the autoLoginEndpoint and the authentification
    // just was successfull there is no risk exposing it in the query
    const url = createPwaUrl(PWA_ROUTE.AUTO_LOGIN, { token })

    return res.redirect(url)
  }
}
