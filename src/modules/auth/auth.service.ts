import { OrganizationService } from '../organization/organization.service'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from '../user/entities/user.entity'
import { UserService } from '../user/user.service'
import { Jwt } from './strategies/jwt.strategy'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

interface LoginOptions {
  /**
   * If the lastLogin property for the user should be updated with the current timestamp
   */
  setLastLogin: boolean
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService
  ) {}

  /**
   * @throws {NotFoundException} If there is no user with the informed username
   * @throws {UnauthorizedException} If the password is invalid
   */
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
  async login(user: User, options?: LoginOptions): Promise<{ user: User; token: Jwt }> {
    if (options?.setLastLogin) {
      await this.userService.userRepository.persistAndFlush({ ...user, lastLogin: new Date() })
    }

    const token = { type: 'bearer', value: this.jwtService.sign({ sub: user.id }) }

    delete user.password

    return { user, token }
  }

  /**
   * Returns the given user and his new bearer JWT
   */
  async loginWithToken(token: string): Promise<{ user: User; token: Jwt }> {
    const decodeResult = this.jwtService.decode(token)

    if (typeof decodeResult !== 'object' || !decodeResult || typeof decodeResult.sub !== 'number') {
      throw new UnauthorizedException('Invalid token')
    }

    const user = await this.userService.userRepository.findOne({ id: decodeResult.sub })

    if (!user) {
      throw new UnauthorizedException('User in token non existent or deactivated')
    }

    const newToken = { type: 'bearer', value: this.jwtService.sign({ sub: user.id }) }

    delete user.password

    return { user, token: newToken }
  }

  async getUserForGoogleProfile(googleProfileId: string): Promise<User | null> {
    return this.userService.userRepository.findOne({ oauthProfileId: googleProfileId, oauthProvider: 'google' })
  }

  /**
   * Verifies if the provided email address is in use by a user, organization or some other entity
   */
  async checkEmailAddressInUse(email: string): Promise<boolean> {
    const user = await this.userService.userRepository.findOne({ email }, { fields: ['id'] })
    const org = await this.organizationService.organizationRepository.findOne({ billingEmail: email }, { fields: ['id'] })

    return !!(user || org)
  }
}
