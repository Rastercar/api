import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { MasterUser, User } from '@prisma/client'
import * as bcrypt from 'bcrypt'

import { ERROR_CODES } from '../../../constants/error.codes'
import { PrismaService } from '../../../database/prisma.service'
import { ChangePasswordDTO } from '../../user/dtos/change-password.dto'
import { isMasterUser } from '../../user/user.utils'
import { LoginResponse } from '../models/login-response.model'
import { AuthTokenService } from './auth-token.service'

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

  private async loginForUser(user: User, options: LoginOptions) {
    if (options?.setLastLogin) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })
    }

    const token = this.authTokenService.createTokenForUser(user, options.tokenOptions)

    if (user.googleProfileId) {
      // There`s a chance the user`s old unregistered user was not deleted whenever he finished his
      // registration, since the registration endpoint cannot certify the user being registered had
      // a unregisteredUser record, so we ensure the deletion whenever logging in
      await this.prisma.unregisteredUser.deleteMany({
        where: {
          oauthProvider: 'google',
          oauthProfileId: user.googleProfileId
        }
      })
    }

    return { user, token }
  }

  private async loginForMasterUser(user: MasterUser, options: LoginOptions) {
    if (options?.setLastLogin) {
      await this.prisma.masterUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })
    }

    const token = this.authTokenService.createTokenForUser(user, options.tokenOptions)

    return { user, token }
  }

  /**
   * Returns the given user and his new bearer JWT
   */
  async login(userToLogin: User | MasterUser, options: LoginOptions = { setLastLogin: true }): Promise<LoginResponse> {
    const isMaster = !!(userToLogin as MasterUser).masterAccessLevelId

    const { user, token } = isMaster
      ? await this.loginForUser(userToLogin as User, options)
      : await this.loginForMasterUser(userToLogin as MasterUser, options)

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
      where: { id: userId, autoLoginToken: autoLoginToken }
    })

    if (!user) throw new UnauthorizedException('No user found with this autologin token')

    const newToken = this.authTokenService.createTokenForUser(user)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { autoLoginToken: null }
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
  async validateUserByCredentials(credentials: { email: string; password: string }): Promise<User | MasterUser> {
    const { email, password } = credentials

    // Note: if populating organization.users implement a solution to delete their passwords
    const master_user = await this.prisma.masterUser.findUnique({
      where: { email },
      include: { accessLevel: true, masterAccessLevel: true }
    })

    // TODO better me
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { accessLevel: true, organization: true }
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
  async setUserAutoLoginToken(user: User): Promise<string> {
    const token = this.authTokenService.createAutoLoginTokenForUser(user.id)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { autoLoginToken: token.value }
    })

    return token.value
  }

  /**
   * Generates and stores in the db a new one time reset password token for the user
   *
   * @returns the generated token
   */
  async setUserResetPasswordToken(user: User | MasterUser): Promise<string> {
    const token = this.authTokenService.createTokenForUser(user, { expiresIn: '5m', audience: 'rastercar-api/auth/reset-password' })

    const args = {
      where: { id: user.id },
      data: { resetPasswordToken: token.value }
    }

    isMasterUser(user) ? await this.prisma.masterUser.update(args) : await this.prisma.user.update(args)

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

    const isMaster = !!(userToUpdate as MasterUser).masterAccessLevelId

    if (userToUpdate.resetPasswordToken !== passwordResetToken) {
      const errorMsg =
        userToUpdate.resetPasswordToken === null
          ? 'Token was valid but user does not have a resetPasswordToken set'
          : 'Token was valid but a new password reset token was generated'

      throw new UnauthorizedException(errorMsg)
    }

    const args = { where: { id: userToUpdate.id }, data: { password: bcrypt.hashSync(password, 10), reset_password_token: null } }

    isMaster ? await this.prisma.masterUser.update(args) : await this.prisma.user.update(args)

    return userToUpdate
  }

  /**
   * Verifies if the provided email address is in use by a user or master user
   */
  async checkEmailAddressInUse(email: string, options?: CheckEmailInUseOptions): Promise<boolean> {
    const [org, masterUser, user] = await Promise.all([
      this.prisma.organization.findUnique({ where: { billingEmail: email }, select: { id: true } }),
      this.prisma.masterUser.findUnique({ where: { email }, select: { id: true } }),
      this.prisma.user.findUnique({ where: { email }, select: { id: true } })
    ])

    const inUse = !!(user || org || masterUser)

    if (options?.throwExceptionIfInUse && inUse) {
      throw new BadRequestException(ERROR_CODES.EMAIL_IN_USE)
    }

    return inUse
  }
}
