import { AuthTokenService } from './auth-token.service'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { master_user, user } from '@prisma/client'
import { PrismaService } from '../../../database/prisma.service'
import { LoginResponse } from '../models/login-response.model'
import * as bcrypt from 'bcrypt'
import { ChangePasswordDTO } from '../../user/dtos/change-password.dto'
import { ERROR_CODES } from '../../../constants/error.codes'
import { isMasterUser } from '../../user/user.utils'

interface LoginOptions {
  /**
   * If the lastLogin property for the user should be updated with the current timestamp (default: true)
   */
  setLastLogin?: boolean
  tokenOptions?: JwtSignOptions
}

interface CheckEmailInUseOptions {
  /**
   * If true will throw a BadRequestException with ERROR_CODES.EMAIL_IN_USE when the email is in use
   */
  throwExceptionIfInUse?: boolean
}

@Injectable()
export class AuthService {
  constructor(readonly prisma: PrismaService, readonly jwtService: JwtService, readonly authTokenService: AuthTokenService) {}

  private async loginForUser(user: user, options: LoginOptions) {
    if (options?.setLastLogin) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      })
    }

    const token = this.authTokenService.createTokenForUser(user, options.tokenOptions)

    if (user.google_profile_id) {
      // There`s a chance the user`s old unregistered user was not deleted whenever he finished his
      // registration, since the registration endpoint cannot certify the user being registered had
      // a unregisteredUser record, so we ensure the deletion whenever logging in
      await this.prisma.unregistered_user.deleteMany({
        where: {
          oauth_provider: 'google',
          oauth_profile_id: user.google_profile_id
        }
      })
    }

    return { user, token }
  }

  private async loginForMasterUser(user: master_user, options: LoginOptions) {
    if (options?.setLastLogin) {
      await this.prisma.master_user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      })
    }

    const token = this.authTokenService.createTokenForUser(user, options.tokenOptions)

    return { user, token }
  }

  /**
   * Returns the given user and his new bearer JWT
   */
  async login(userToLogin: user | master_user, options: LoginOptions = { setLastLogin: true }): Promise<LoginResponse> {
    const isMaster = !!(userToLogin as master_user).master_access_level_id

    const { user, token } = isMaster
      ? await this.loginForUser(userToLogin as user, options)
      : await this.loginForMasterUser(userToLogin as master_user, options)

    // TODO: CHECK IM NOT LEAKING PASSWORDS !
    // https://github.com/prisma/prisma/issues/7380
    // delete user.password
    // delete user.resetPasswordToken

    return { user, token }
  }

  /**
   * Returns the given user and his new bearer JWT
   *
   * @param autoLoginToken A token refering to the user loginWithTokenColumn
   */
  async loginWithToken(autoLoginToken: string) {
    const userId = await this.authTokenService.getUserIdFromAutoLoginToken(autoLoginToken)

    // The id conditional might seem redundant but with it we can be sure the token was meant for him
    const user = await this.prisma.user.findFirst({
      where: { id: userId, auto_login_token: autoLoginToken }
    })

    if (!user) throw new UnauthorizedException('No user found with this autologin token')

    const newToken = this.authTokenService.createTokenForUser(user)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { auto_login_token: null }
    })

    // TODO: CHECK IM NOT LEAKING PASSWORDS !
    // https://github.com/prisma/prisma/issues/7380
    // delete user.password
    // delete user.resetPasswordToken

    return { user, token: newToken }
  }

  /**
   * Checks if a password is valid against a given hash
   */
  comparePasswords(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword)
  }

  /**
   * Finds a user or a master user by email/password
   *
   * @throws {NotFoundException} If there is no user with the informed username
   * @throws {UnauthorizedException} If the password is invalid
   */
  async validateUserByCredentials(credentials: { email: string; password: string }): Promise<user | master_user> {
    const { email, password } = credentials

    // Note: if populating organization.users implement a solution to delete their passwords
    const master_user = await this.prisma.master_user.findUnique({
      where: { email },
      include: { access_level: true, master_access_level: true }
    })

    // TODO better me
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { access_level: true, organization: true }
    })

    // since emails are unique between the 2 tables, only one of the records should be non null
    const finalUser = user || master_user

    if (!finalUser) throw new NotFoundException('User with provided email not found')

    const passwordIsValid = await this.comparePasswords(password, finalUser.password as string)
    if (!passwordIsValid) throw new UnauthorizedException('Invalid password')

    return finalUser
  }

  /**
   * Generates and stores in the db a new one time auto login token for the user
   *
   * @returns the generated token
   */
  async setUserAutoLoginToken(user: user): Promise<string> {
    const token = this.authTokenService.createAutoLoginTokenForUser(user.id)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { auto_login_token: token.value }
    })

    return token.value
  }

  /**
   * Generates and stores in the db a new one time reset password token for the user
   *
   * @returns the generated token
   */
  async setUserResetPasswordToken(user: user | master_user): Promise<string> {
    const token = this.authTokenService.createTokenForUser(user, { expiresIn: '5m', audience: 'rastercar-api/auth/reset-password' })

    const args = {
      where: { id: user.id },
      data: { reset_password_token: token.value }
    }

    isMasterUser(user) ? await this.prisma.master_user.update(args) : await this.prisma.user.update(args)

    return token.value
  }

  /**
   * Sets a new password for the user in the resetPassword token, checking
   * if the token is valid and is contained by the user
   *
   * @returns the user with the new password
   */
  async resetUserPasswordByToken({ password, passwordResetToken }: ChangePasswordDTO) {
    const decodedToken = await this.authTokenService.validateAndDecodeToken(passwordResetToken)
    const userToUpdate = await this.authTokenService.getUserFromDecodedTokenOrFail(decodedToken)

    const isMaster = !!(userToUpdate as master_user).master_access_level_id

    if (userToUpdate.reset_password_token !== passwordResetToken) {
      const errorMsg =
        userToUpdate.reset_password_token === null
          ? 'Token was valid but user does not have a resetPasswordToken set'
          : 'Token was valid but a new password reset token was generated'

      throw new UnauthorizedException(errorMsg)
    }

    const args = { where: { id: userToUpdate.id }, data: { password: bcrypt.hashSync(password, 10), reset_password_token: null } }

    isMaster ? await this.prisma.master_user.update(args) : await this.prisma.user.update(args)

    return userToUpdate
  }

  /**
   * Verifies if the provided email address is in use by a user or master user
   */
  async checkEmailAddressInUse(email: string, options?: CheckEmailInUseOptions): Promise<boolean> {
    const [org, masterUser, user] = await Promise.all([
      this.prisma.organization.findUnique({ where: { billing_email: email }, select: { id: true } }),
      this.prisma.master_user.findUnique({ where: { email }, select: { id: true } }),
      this.prisma.user.findUnique({ where: { email }, select: { id: true } })
    ])

    const inUse = !!(user || org || masterUser)

    if (options?.throwExceptionIfInUse && inUse) {
      throw new BadRequestException(ERROR_CODES.EMAIL_IN_USE)
    }

    return inUse
  }
}
