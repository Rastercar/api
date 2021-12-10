import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '../../user/user.service'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'

interface JwtPayload {
  sub: number
}

export interface Jwt {
  type: string
  value: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private userService: UserService) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET')
    })
  }

  /**
   * Validates the user on the JWT sub (subject) field and exposes it on req.user
   */
  async validate({ sub: userID }: JwtPayload) {
    const user = await this.userService.userRepository.findOne({ id: userID })
    if (!user) throw new UnauthorizedException('No user found with id')

    return user
  }
}
