import { Injectable } from '@nestjs/common'
import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '../auth.service'
import { User } from '../../user/user.entity'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username', passwordField: 'password' })
  }

  validate(username: string, password: string): Promise<User> {
    return this.authService.validateUserByCredentials({ username, password })
  }
}
