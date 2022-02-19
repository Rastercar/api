import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UnregisteredUserRepository } from '../user/repositories/unregistered-user.repository'
import { OrganizationRepository } from '../organization/repositories/organization.repository'
import { MasterUserRepository } from '../user/repositories/master-user.repository'
import { UserRepository } from '../user/repositories/user.repository'
import { MasterUser } from '../user/entities/master-user.entity'
import { LoginResponse } from './models/login-response.model'
import { ERROR_CODES } from '../../constants/error.codes'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { User } from '../user/entities/user.entity'
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
    readonly masterUserRepository: MasterUserRepository,
    readonly organizationRepository: OrganizationRepository,
    readonly unregisteredUserRepository: UnregisteredUserRepository
  ) {}

  private createTokenForUser(user: User | MasterUser, options?: JwtSignOptions) {
    const isMaster = user instanceof MasterUser
    return { type: 'bearer', value: this.jwtService.sign({ sub: `${isMaster ? 'masteruser' : 'user'}-${user.id}` }, options) }
  }

  private async loginForUser(user: User, options: LoginOptions) {
    const userCopy = { ...user }

    if (options?.setLastLogin) {
      user.lastLogin = new Date()
      await this.userRepository.persistAndFlush(user)
    }

    const token = this.createTokenForUser(user, options.tokenOptions)

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

    const token = this.createTokenForUser(user, options.tokenOptions)

    delete userCopy.password

    return { user: userCopy, token }
  }

  /**
   * Returns the given user and his new bearer JWT
   */
  async login(user: User | MasterUser, options: LoginOptions = { setLastLogin: true }): Promise<LoginResponse> {
    return user instanceof User ? this.loginForUser(user, options) : this.loginForMasterUser(user, options)
  }

  /**
   * Returns the given user and his new bearer JWT
   */
  async loginWithToken(token: string): Promise<LoginResponse> {
    await this.jwtService.verifyAsync(token).catch(() => {
      throw new UnauthorizedException('Invalid/expired token')
    })

    const decodeResult = this.jwtService.decode(token)

    if (typeof decodeResult !== 'object' || !decodeResult || typeof decodeResult.sub !== 'string') {
      throw new UnauthorizedException('Invalid token')
    }

    const id = parseInt(decodeResult.sub.replace(/\D/g, ''), 10)

    let user: MasterUser | User | null = await this.userRepository.findOne({ id })
    if (!user) user = await this.masterUserRepository.findOne({ id })

    if (!user) {
      throw new UnauthorizedException(`User (id: ${decodeResult.sub}) in token non existent or deactivated`)
    }

    const newToken = this.createTokenForUser(user)

    const { password, ...passwordLessUser } = user

    return { user: passwordLessUser, token: newToken }
  }

  /**
   * @throws {NotFoundException} If there is no user with the informed username
   * @throws {UnauthorizedException} If the password is invalid
   */
  async validateUserByCredentials(credentials: { email: string; password: string }): Promise<User | MasterUser> {
    const { email, password } = credentials

    const mUser = await this.masterUserRepository.findOne({ email }, { populate: true })
    const user = await this.userRepository.findOne({ email }, { populate: true })

    // since emails are unique between the 2 tables, only one of the records should be non null
    const finalUser = user || mUser

    if (!finalUser) throw new NotFoundException('User with provided email not found')

    const passwordIsValid = await bcrypt.compare(password, finalUser.password as string)
    if (!passwordIsValid) throw new UnauthorizedException('Invalid password')

    return finalUser
  }

  getUserForGoogleProfile(googleProfileId: string): Promise<User | null> {
    return this.userRepository.findOne({ googleProfileId })
  }

  /**
   * Verifies if the provided email address is in use by a user, organization or some other entity
   */
  async checkEmailAddressInUse(email: string, options?: CheckEmailInUseOptions): Promise<boolean> {
    const [org, masterUser, user] = await Promise.all([
      this.organizationRepository.findOne({ billingEmail: email }, { fields: ['id'] }),
      this.masterUserRepository.findOne({ email }, { fields: ['id'] }),
      this.userRepository.findOne({ email }, { fields: ['id'] })
    ])

    console.log({ org, masterUser, user })

    const inUse = !!(user || org || masterUser)

    if (options?.throwExceptionIfInUse && inUse) {
      throw new BadRequestException(ERROR_CODES.EMAIL_IN_USE)
    }

    return inUse
  }
}
