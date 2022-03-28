import { MasterUser } from '../../user/entities/master-user.entity'
import { AuthTokenService } from '../services/auth-token.service'
import { User } from '../../user/entities/user.entity'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'

export interface JwtPayload {
  /**
   * The token subject, a string in the format: {user | masteruser}{user_or_masteruser_id} or a email address
   *
   * ex: masteruser-1, user-3, jhon@gmail.com
   */
  sub: string
}

export interface Jwt {
  type: string
  value: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, readonly authTokenService: AuthTokenService) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false
    })
  }

  /**
   * Validates the user on the JWT and exposes it on req.user
   */
  validate(tokenPayload: JwtPayload): Promise<User | MasterUser> {
    return this.authTokenService.getUserFromDecodedTokenOrFail(tokenPayload)
  }
}
