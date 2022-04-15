import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { MasterUser } from '../entities/master-user.entity'
import { User } from '../entities/user.entity'

export const checkRequestUserIsOfType = (context: ExecutionContext, type: typeof User | typeof MasterUser) => {
  const isGraphqlContext = context.getType<GqlContextType>() === 'graphql'
  const { user } = isGraphqlContext ? GqlExecutionContext.create(context).getContext().req : context.switchToHttp().getRequest()

  if (!(user instanceof type)) {
    throw new UnauthorizedException(`Route only accesible for ${type === User ? 'Users' : 'MasterUsers'}`)
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
    return checkRequestUserIsOfType(context, MasterUser)
  }
}
