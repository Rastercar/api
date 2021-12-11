import { ValidLoginRequestGuard } from './guards/valid-login-request.guard'
import { RequestUser } from './decorators/request-user.decorator'
import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { GoogleAuthGuard } from './guards/google-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { Profile } from 'passport-google-oauth20'
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

  /**
   * Redirects the user to the google login page using the google
   * oauth2 passport strategy implemented by the google auth guard
   */
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  /**
   * This is where the user is redirected after a successfull login
   * with google oauth2
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@RequestUser() googleProfile: Profile) {
    // TODO: Here we should probably login the user and redirect him to the pwa if the user exists on the DB
    // else we should redirect him to a registration page with fields autocompleted
    return googleProfile
  }
}
