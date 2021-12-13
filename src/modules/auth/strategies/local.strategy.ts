import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '../auth.service'
import { User } from '../../user/user.entity'
import { Injectable } from '@nestjs/common'
import { Strategy } from 'passport-local'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' })
  }

  validate(email: string, password: string): Promise<User> {
    return this.authService.validateUserByCredentials({ email, password })
  }
}
