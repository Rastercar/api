import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UnregisteredUserRepository } from '../../user/repositories/unregistered-user.repository'
import { OrganizationRepository } from '../../organization/repositories/organization.repository'
import { MasterUserRepository } from '../../user/repositories/master-user.repository'
import { UserRepository } from '../../user/repositories/user.repository'
import { ChangePasswordDTO } from '../../user/dtos/change-password.dto'
import { MasterUser } from '../../user/entities/master-user.entity'
import { LoginResponse } from '../models/login-response.model'
import { ERROR_CODES } from '../../../constants/error.codes'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { AuthTokenService } from './auth-token.service'
import { User } from '../../user/entities/user.entity'
import * as bcrypt from 'bcrypt'

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
  constructor(
    readonly jwtService: JwtService,
    readonly userRepository: UserRepository,
    readonly authTokenService: AuthTokenService,
    readonly masterUserRepository: MasterUserRepository,
    readonly organizationRepository: OrganizationRepository,
    readonly unregisteredUserRepository: UnregisteredUserRepository
  ) {}

  private async loginForUser(user: User, options: LoginOptions) {
    const userCopy = { ...user }

    if (options?.setLastLogin) {
      user.lastLogin = new Date()
      await this.userRepository.persistAndFlush(user)
    }

    const token = this.authTokenService.createTokenForUser(user, options.tokenOptions)

    if (userCopy.googleProfileId) {
      // There`s a chance the user`s old unregistered user was not deleted whenever he finished his registration, since the registration
      // endpoint cannot certify the user being registered had a unregisteredUser record, so we ensure the deletion whenever logging in
      await this.unregisteredUserRepository.nativeDelete({
        oauthProvider: 'google',
        oauthProfileId: userCopy.googleProfileId
      })
    }

    delete userCopy.password

    return { user: userCopy, token }
  }

  private async loginForMasterUser(user: MasterUser, options: LoginOptions) {
    const userCopy = { ...user }

    if (options?.setLastLogin) {
      user.lastLogin = new Date()
      await this.userRepository.persistAndFlush(user)
    }

    const token = this.authTokenService.createTokenForUser(user, options.tokenOptions)

    delete userCopy.password

    return { user: userCopy, token }
  }

  /**
   * Returns the given user and his new bearer JWT
   */
  async login(user: User | MasterUser, options: LoginOptions = { setLastLogin: true }): Promise<LoginResponse> {
    console.log(user)

    return user instanceof User ? this.loginForUser(user, options) : this.loginForMasterUser(user, options)
  }

  /**
   * Returns the given user and his new bearer JWT
   */
  async loginWithToken(token: string): Promise<LoginResponse> {
    const jwtPayload = await this.authTokenService.validateAndDecodeToken(token, 'Could not create new token, original token invalid')

    const user = await this.authTokenService.getUserFromDecodedTokenOrFail(jwtPayload)

    const newToken = this.authTokenService.createTokenForUser(user)

    // Do not `delete` user.password as this would affect the ref on the identity map
    const { password, ...passwordLessUser } = user

    return { user: passwordLessUser, token: newToken }
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
    const mUser = await this.masterUserRepository.findOne({ email }, { populate: ['accessLevel', 'password', 'masterAccessLevel'] })
    const user = await this.userRepository.findOne({ email }, { populate: ['password', 'accessLevel', 'organization'] })

    // since emails are unique between the 2 tables, only one of the records should be non null
    const finalUser = user || mUser

    if (!finalUser) throw new NotFoundException('User with provided email not found')

    const passwordIsValid = await this.comparePasswords(password, finalUser.password as string)
    if (!passwordIsValid) throw new UnauthorizedException('Invalid password')

    return finalUser
  }

  getUserForGoogleProfile(googleProfileId: string): Promise<User | null> {
    return this.userRepository.findOne({ googleProfileId })
  }

  /**
   * Generates and stores in the db a new one time reset password token for the user
   *
   * @returns the generated token
   */
  async setUserResetPasswordToken(user: User | MasterUser): Promise<string> {
    const token = this.authTokenService.createTokenForUser(user, { expiresIn: '5m', audience: 'rastercar-api/auth/reset-password' })
    user.resetPasswordToken = token.value

    user instanceof User ? await this.userRepository.persistAndFlush(user) : await this.masterUserRepository.persistAndFlush(user)

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

    userToUpdate instanceof User
      ? await this.userRepository.populate(userToUpdate, ['resetPasswordToken'])
      : await this.masterUserRepository.populate(userToUpdate, ['resetPasswordToken'])

    if (userToUpdate.resetPasswordToken !== passwordResetToken) {
      const errorMsg =
        userToUpdate.resetPasswordToken === null
          ? 'Token was valid but user does not have a resetPasswordToken set'
          : 'Token was valid but a new password reset token was generated'

      throw new UnauthorizedException(errorMsg)
    }

    userToUpdate.password = bcrypt.hashSync(password, 10)
    userToUpdate.resetPasswordToken = null

    userToUpdate instanceof User
      ? await this.userRepository.persistAndFlush(userToUpdate)
      : await this.masterUserRepository.persistAndFlush(userToUpdate)

    return userToUpdate
  }

  /**
   * Verifies if the provided email address is in use by a user or master user
   */
  async checkEmailAddressInUse(email: string, options?: CheckEmailInUseOptions): Promise<boolean> {
    const [org, masterUser, user] = await Promise.all([
      this.organizationRepository.findOne({ billingEmail: email }, { fields: ['id'] }),
      this.masterUserRepository.findOne({ email }, { fields: ['id'] }),
      this.userRepository.findOne({ email }, { fields: ['id'] })
    ])

    const inUse = !!(user || org || masterUser)

    if (options?.throwExceptionIfInUse && inUse) {
      throw new BadRequestException(ERROR_CODES.EMAIL_IN_USE)
    }

    return inUse
  }
}
