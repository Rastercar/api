import { MasterUser } from '../../user/entities/master-user.entity'
import { User } from '../../user/entities/user.entity'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '../services/auth.service'
import { Injectable } from '@nestjs/common'
import { Strategy } from 'passport-local'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' })
  }

  validate(email: string, password: string): Promise<User | MasterUser> {
    return this.authService.validateUserByCredentials({ email, password })
  }
}
