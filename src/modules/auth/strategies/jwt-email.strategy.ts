import { MasterUserRepository } from '../../user/repositories/master-user.repository'
import { UserRepository } from '../../user/repositories/user.repository'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'

/**
 * Very similar to the JWT strategy, but expects the user or master user email as the token subject (sub field)
 *
 * Note: this is used to confirm email adresses for users and master users, we do not use the regular jwt with
 * the user/master user id on it as theyre sent after logging in, so a malicious attacker could just send these
 * tokens to verify the email adress without doing so
 */
@Injectable()
export class JwtEmailStrategy extends PassportStrategy(Strategy, 'jwtemail') {
  constructor(configService: ConfigService, private userRepository: UserRepository, private masterUserRepository: MasterUserRepository) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false
    })
  }

  async validate({ sub: userEmail }: { sub: string }) {
    const masterUser = await this.masterUserRepository.findOne({ email: userEmail })
    if (masterUser) return masterUser

    const regularUser = await this.userRepository.findOne({ email: userEmail })
    if (regularUser) return regularUser

    throw new UnauthorizedException(`No user or master user found with email ${userEmail}`)
  }
}
