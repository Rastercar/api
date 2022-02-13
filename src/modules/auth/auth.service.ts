import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { OrganizationService } from '../organization/organization.service'
import { MasterUserService } from '../user/services/master-user.service'
import { MasterUser } from '../user/entities/master-user.entity'
import { LoginResponse } from './models/login-response.model'
import { UserService } from '../user/services/user.service'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { UseRequestContext } from '@mikro-orm/nestjs'
import { User } from '../user/entities/user.entity'
import { MikroORM } from '@mikro-orm/core'
import * as bcrypt from 'bcrypt'

interface LoginOptions {
  /**
   * If the lastLogin property for the user should be updated with the current timestamp (default: true)
   */
  setLastLogin?: boolean
  tokenOptions?: JwtSignOptions
}

@Injectable()
export class AuthService {
  constructor(
    readonly orm: MikroORM,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly masterUserService: MasterUserService,
    private readonly organizationService: OrganizationService
  ) {}

  private createTokenForUser(user: User | MasterUser, options?: JwtSignOptions) {
    const isMaster = user instanceof MasterUser
    return { type: 'bearer', value: this.jwtService.sign({ sub: `${isMaster ? 'masteruser' : 'user'}-${user.id}` }, options) }
  }

  private async loginForUser(user: User, options: LoginOptions) {
    const userCopy = { ...user }

    if (options?.setLastLogin) {
      user.lastLogin = new Date()
      await this.userService.userRepository.persistAndFlush(user)
    }

    const token = this.createTokenForUser(user, options.tokenOptions)

    const userUsesOauth = userCopy.oauthProfileId && userCopy.oauthProvider

    if (userUsesOauth) {
      // There`s a chance the user`s old unregistered user was not deleted whenever he finished his registration, since the registration
      // endpoint cannot certify the user being registered had a unregisteredUser record, so we ensure the deletion whenever logging in
      await this.userService.unregisteredUserRepository.nativeDelete({
        oauthProvider: userCopy.oauthProvider,
        oauthProfileId: userCopy.oauthProfileId
      })
    }

    delete userCopy.password

    return { user: userCopy, token }
  }

  private async loginForMasterUser(user: MasterUser, options: LoginOptions) {
    const userCopy = { ...user }

    if (options?.setLastLogin) {
      user.lastLogin = new Date()
      await this.userService.userRepository.persistAndFlush(user)
    }

    const token = this.createTokenForUser(user, options.tokenOptions)

    delete userCopy.password

    return { user: userCopy, token }
  }

  /**
   * Returns the given user and his new bearer JWT
   */
  @UseRequestContext()
  async login(user: User | MasterUser, options: LoginOptions = { setLastLogin: true }): Promise<LoginResponse> {
    return user instanceof User ? this.loginForUser(user, options) : this.loginForMasterUser(user, options)
  }

  /**
   * Returns the given user and his new bearer JWT
   */
  @UseRequestContext()
  async loginWithToken(token: string): Promise<LoginResponse> {
    await this.jwtService.verifyAsync(token).catch(() => {
      throw new UnauthorizedException('Invalid/expired token')
    })

    const decodeResult = this.jwtService.decode(token)

    if (typeof decodeResult !== 'object' || !decodeResult || typeof decodeResult.sub !== 'string') {
      throw new UnauthorizedException('Invalid token')
    }

    const id = parseInt(decodeResult.sub.replace(/\D/g, ''), 10)

    let user: MasterUser | User | null = await this.userService.userRepository.findOne({ id })
    if (!user) user = await this.masterUserService.masterUserRepository.findOne({ id })

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
  @UseRequestContext()
  async validateUserByCredentials(credentials: { email: string; password: string }): Promise<User | MasterUser> {
    const { email, password } = credentials
    const mUser = await this.masterUserService.masterUserRepository.findOne({ email }, { populate: ['accessLevel', 'masterAccessLevel'] })
    const user = await this.userService.userRepository.findOne({ email }, { populate: ['organization', 'accessLevel'] })

    // since emails are unique between the 2 tables, only one of the records should be non null
    const finalUser = user || mUser

    if (!finalUser) throw new NotFoundException('User with provided email not found')

    const passwordIsValid = await bcrypt.compare(password, finalUser.password as string)
    if (!passwordIsValid) throw new UnauthorizedException('Invalid password')

    return finalUser
  }

  @UseRequestContext()
  getUserForGoogleProfile(googleProfileId: string): Promise<User | null> {
    return this.userService.userRepository.findOne({ oauthProfileId: googleProfileId, oauthProvider: 'google' })
  }

  /**
   * Verifies if the provided email address is in use by a user, organization or some other entity
   */
  @UseRequestContext()
  async checkEmailAddressInUse(email: string): Promise<boolean> {
    const user = await this.userService.userRepository.findOne({ email }, { fields: ['id'] })
    const masterUser = await this.masterUserService.masterUserRepository.findOne({ email }, { fields: ['id'] })
    const org = await this.organizationService.organizationRepository.findOne({ billingEmail: email }, { fields: ['id'] })

    return !!(user || org || masterUser)
  }
}
