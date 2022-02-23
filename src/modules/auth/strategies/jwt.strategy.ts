import { MasterUserRepository } from '../../user/repositories/master-user.repository'
import { UserRepository } from '../../user/repositories/user.repository'
import { MasterUser } from '../../user/entities/master-user.entity'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from '../../user/entities/user.entity'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'

interface JwtPayload {
  /**
   * The token subject, a string in the format: {user | masteruser}{user_or_masteruser_id}
   *
   * ex: 'masteruser-1', 'user-3'
   */
  sub: string
}

export interface Jwt {
  type: string
  value: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private userRepository: UserRepository, private masterUserRepository: MasterUserRepository) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET')
    })
  }

  /**
   * Validates the user on the JWT sub (subject) field and exposes it on req.user
   */
  async validate({ sub }: JwtPayload): Promise<User | MasterUser> {
    const id = parseInt(sub.replace(/\D/g, ''), 10)

    const idRefersToMasterUser = sub.startsWith('masteruser')
    const idRefersToUser = sub.startsWith('user')

    if (!idRefersToMasterUser && !idRefersToUser) {
      throw new UnauthorizedException(`JWT subject does not start with 'user' or 'masteruser' followed by its id`)
    }

    const user = idRefersToUser ? await this.userRepository.findOne({ id }) : await this.masterUserRepository.findOne({ id })

    if (!user) throw new UnauthorizedException(`No ${idRefersToUser ? 'user' : 'master user'} found with id`)

    return user
  }
}
