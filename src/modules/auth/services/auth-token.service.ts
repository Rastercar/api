import { MasterUserRepository } from '../../user/repositories/master-user.repository'
import { UserRepository } from '../../user/repositories/user.repository'
import { MasterUser } from '../../user/entities/master-user.entity'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { JwtPayload } from '../strategies/jwt.strategy'
import { User } from '../../user/entities/user.entity'
import { isEmail } from 'class-validator'

const isJwtPayloadWithStringSubject = (payload: unknown): payload is JwtPayload => {
  return !!payload && typeof payload === 'object' && !Array.isArray(payload) && typeof (payload as JwtPayload).sub === 'string'
}

@Injectable()
export class AuthTokenService {
  constructor(
    readonly jwtService: JwtService,
    readonly userRepository: UserRepository,
    readonly masterUserRepository: MasterUserRepository
  ) {}

  async getUserOrMasterUserByEmail(email: string): Promise<User | MasterUser | null> {
    const masterUser = await this.masterUserRepository.findOne({ email })
    if (masterUser) return masterUser

    return this.userRepository.findOne({ email })
  }

  async validateAndDecodeToken(token: string, errorMessage = 'Invalid/expired token') {
    await this.jwtService.verifyAsync(token).catch(() => {
      throw new UnauthorizedException(errorMessage)
    })

    return this.jwtService.decode(token)
  }

  /**
   * Checks if a subject is a valid identifier used in JWT for users and master users
   *
   * @throws {UnauthorizedException} on failure
   */
  checkSubjectIsValidUserIdentifier(s: string) {
    const isValid = new RegExp('(?:user|masteruser){1}-\\d{1,7}').test(s)

    if (!isValid) {
      throw new UnauthorizedException(`JWT subject does not start with 'user-' or 'masteruser-' followed by its id`)
    }

    const id = parseInt(s.replace(/\D/g, ''), 10)

    const idRefersTo = s.substring(0, s.indexOf('-')) as 'user' | 'masteruser'

    return { id, idRefersTo }
  }

  /**
   * Creates a token with a payload that specifies the user type and id, which is
   * expected in the JwtAuthGuard
   */
  createAutoLoginTokenForUser(userId: number) {
    const sub = `autologin-user-${userId}`
    return { type: 'autologin', value: this.jwtService.sign({ sub, audience: 'rastercar-api/auth/reset-password', expiresIn: '2m' }) }
  }

  async getUserIdFromAutoLoginToken(autoLoginToken: string) {
    const payload = await this.validateAndDecodeToken(autoLoginToken, 'Invalid autologin token')

    if (!isJwtPayloadWithStringSubject(payload)) {
      throw new UnauthorizedException('Invalid autologin token content, subject not found')
    }

    if (!payload.sub.startsWith('autologin-user-')) {
      throw new UnauthorizedException(`autologin JWT subject does not start with 'autologin-user-' followed by its id`)
    }

    return parseInt(payload.sub.replace(/\D/g, ''), 10)
  }

  /**
   * Creates a token with a payload that specifies the user type and id, which is
   * expected in the JwtAuthGuard
   */
  createTokenForUser(user: User | MasterUser, options?: JwtSignOptions) {
    const isMaster = user instanceof MasterUser
    const sub = `${isMaster ? 'masteruser' : 'user'}-${user.id}`

    return {
      type: 'bearer',
      value: this.jwtService.sign({ sub }, options)
    }
  }

  /**
   * Gets the user/master user on the JWT sub (subject) field
   *
   * This expects the subject is either a `email adress` or a string like `user-{id}` or `masteruser-{id}`
   *
   * @throws {UnauthorizedException} if the token is invalid or a user is not found
   */
  async getUserFromDecodedTokenOrFail<T>(jwtPayload: T extends Promise<unknown> ? never : T): Promise<User | MasterUser> {
    if (!isJwtPayloadWithStringSubject(jwtPayload)) {
      throw new UnauthorizedException('Invalid token content, subject not found')
    }

    const { sub: emailOrIdentifier } = jwtPayload

    if (isEmail(emailOrIdentifier)) {
      const user = await this.getUserOrMasterUserByEmail(emailOrIdentifier)
      if (!user) throw new UnauthorizedException(`No user or master user found with email ${emailOrIdentifier}`)

      return user
    }

    const { id, idRefersTo } = this.checkSubjectIsValidUserIdentifier(emailOrIdentifier)

    const user = idRefersTo === 'user' ? await this.userRepository.findOne({ id }) : await this.masterUserRepository.findOne({ id })

    if (!user) throw new UnauthorizedException(`No ${idRefersTo} found with id`)

    return user
  }
}
