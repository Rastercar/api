import { OrganizationService } from '../organization/organization.service'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { UseRequestContext } from '@mikro-orm/nestjs'
import { User } from '../user/entities/user.entity'
import { UserService } from '../user/user.service'
import { Jwt } from './strategies/jwt.strategy'
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
    private readonly organizationService: OrganizationService
  ) {}

  /**
   * @throws {NotFoundException} If there is no user with the informed username
   * @throws {UnauthorizedException} If the password is invalid
   */
  @UseRequestContext()
  async validateUserByCredentials(credentials: { email: string; password: string }): Promise<User> {
    const { email, password } = credentials
    const user = await this.userService.userRepository.findOneOrFail({ email })

    const passwordIsValid = await bcrypt.compare(password, user.password as string)
    if (!passwordIsValid) throw new UnauthorizedException('Invalid password')

    return user
  }

  /**
   * Returns the given user and his new bearer JWT
   */
  @UseRequestContext()
  async login(user: User, options: LoginOptions = { setLastLogin: true }): Promise<{ user: User; token: Jwt }> {
    const userCopy = { ...user }

    if (options?.setLastLogin) {
      user.lastLogin = new Date()
      await this.userService.userRepository.persistAndFlush(user)
    }

    const token = { type: 'bearer', value: this.jwtService.sign({ sub: userCopy.id }, options?.tokenOptions) }

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

  /**
   * Returns the given user and his new bearer JWT
   */
  @UseRequestContext()
  async loginWithToken(token: string): Promise<{ user: User; token: Jwt }> {
    await this.jwtService.verifyAsync(token).catch(() => {
      throw new UnauthorizedException('Invalid/expired token')
    })

    const decodeResult = this.jwtService.decode(token)

    if (typeof decodeResult !== 'object' || !decodeResult || typeof decodeResult.sub !== 'number') {
      throw new UnauthorizedException('Invalid token')
    }

    const user = await this.userService.userRepository.findOne({ id: decodeResult.sub })

    if (!user) {
      throw new UnauthorizedException(`User (id: ${decodeResult.sub}) in token non existent or deactivated`)
    }

    const newToken = { type: 'bearer', value: this.jwtService.sign({ sub: user.id }) }

    const { password, ...passwordLessUser } = user

    return { user: passwordLessUser, token: newToken }
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
    const org = await this.organizationService.organizationRepository.findOne({ billingEmail: email }, { fields: ['id'] })

    return !!(user || org)
  }
}
