import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * Just like JwtAuthGuard, but expects the user/master_user
 * email adress in the JWT subject field
 */
@Injectable()
export class JwtEmailAuthGuard extends AuthGuard('jwtemail') {}
