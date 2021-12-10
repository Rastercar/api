import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common'
import { User } from '../../user/user.entity'

export function requestUserFactory(propName: keyof User | undefined, ctx: ExecutionContext) {
  const { user } = ctx.switchToHttp().getRequest()

  if (!user) throw new InternalServerErrorException('Could not get user from the request')

  return propName ? user[propName] : user
}

/**
 * Extracts the request user or one of his properties if specified
 *
 * ```ts
 * .@Get('my-route')
 * routeHandler(.@RequestUser('name') name: string) {
 *   return `user name is ${name}`
 * }
 * ```
 */
export const RequestUser = createParamDecorator(requestUserFactory)
