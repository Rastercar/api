import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

import { checkRequestUserIsOfType } from './master-user-only-route.guard'
// import { checkRequestUserIsOfType } from './master-user-only-route.guard'

/**
 * Validates if the request user is of User type (not MasterUser)
 *
 * note: Call this guard only after populating the request.user
 */
@Injectable()
export class UserOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return checkRequestUserIsOfType(context, 'user')
  }
}
