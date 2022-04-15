import { applyDecorators, CanActivate, UseGuards } from '@nestjs/common'
import { MasterUserOnlyGuard } from '../../user/guards/master-user-only-route.guard'
import { UserOnlyGuard } from '../../user/guards/user-only-route.guard'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

interface UserAuthOptions {
  allowedUserType?: 'user' | 'masterUser'
}

/**
 * Checks the request has a valid User JWT and populate request.user
 */
export function UserAuth(options?: UserAuthOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const guards: (Function | CanActivate)[] = [JwtAuthGuard]

  if (options?.allowedUserType !== undefined) {
    guards.push(options?.allowedUserType === 'user' ? UserOnlyGuard : MasterUserOnlyGuard)
  }

  return applyDecorators(UseGuards(...guards))
}
