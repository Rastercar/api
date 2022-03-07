import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql'

import { isMasterUser } from '../user.utils'

export const checkRequestUserIsOfType = (context: ExecutionContext, type: 'user' | 'master_user') => {
  const isGraphqlContext = context.getType<GqlContextType>() === 'graphql'
  const { user } = isGraphqlContext ? GqlExecutionContext.create(context).getContext().req : context.switchToHttp().getRequest()

  const userType = isMasterUser(user) ? 'master_user' : 'user'

  if (userType !== type) {
    throw new UnauthorizedException(`Route only accesible for ${type === 'user' ? 'Users' : 'MasterUsers'}`)
  }

  return true
}

/**
 * Validates if the request user is of MasterUser type (not User)
 *
 * note: Call this guard only after populating the request.user
 */
@Injectable()
export class MasterUserOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return checkRequestUserIsOfType(context, 'master_user')
  }
}
