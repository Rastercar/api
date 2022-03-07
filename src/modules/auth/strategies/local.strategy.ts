import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { User, MasterUser } from '@prisma/client'
import { Strategy } from 'passport-local'

import { AuthService } from '../services/auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(readonly authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' })
  }

  validate(email: string, password: string): Promise<User | MasterUser> {
    return this.authService.validateUserByCredentials({ email, password })
  }
}
