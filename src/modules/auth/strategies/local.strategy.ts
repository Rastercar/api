import { AuthService } from '../services/auth.service'
import { PassportStrategy } from '@nestjs/passport'
import { master_user, user } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { Strategy } from 'passport-local'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(readonly authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' })
  }

  validate(email: string, password: string): Promise<user | master_user> {
    return this.authService.validateUserByCredentials({ email, password })
  }
}
