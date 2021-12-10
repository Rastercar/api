import { ValidLoginRequestGuard } from './guards/valid-login-request.guard'
import { RequestUser } from './decorators/request-user.decorator'
import { Controller, Post, UseGuards } from '@nestjs/common'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { Jwt } from './strategies/jwt.strategy'
import { AuthService } from './auth.service'
import { User } from '../user/user.entity'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(ValidLoginRequestGuard, LocalAuthGuard)
  login(@RequestUser() user: User): Promise<{ user: User; token: Jwt }> {
    return this.authService.login(user)
  }
}
