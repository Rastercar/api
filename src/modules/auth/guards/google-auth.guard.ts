import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * Authorization guard to be used with the google oauth passport strategy,
 * just wraps the oauth error in a HttpError or proceeds with the request
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super()
  }

  handleRequest(error: any, user: any) {
    if (error) throw new UnauthorizedException(error)
    return user
  }
}
