import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { User } from '../../user/entities/user.entity'

export function requestUserFactory(prop: keyof User | undefined, ctx: ExecutionContext) {
  const isGraphqlContext = ctx.getType<GqlContextType>() === 'graphql'

  const { user } = isGraphqlContext ? GqlExecutionContext.create(ctx).getContext().req : ctx.switchToHttp().getRequest()

  if (!user) throw new UnauthorizedException('Cannot get request user')

  return prop ? user[prop] : user
}

/**
 * Extracts the request user or one of his properties if specified
 *
 * ```ts
 * .@JwtAuthGuard() // Remember to use a guard that populates the request user
 * .@Get('my-route')
 * routeHandler(.@RequestUser('name') name: string) {
 *   return `user name is ${name}`
 * }
 * ```
 */
export const RequestUser = createParamDecorator(requestUserFactory)
