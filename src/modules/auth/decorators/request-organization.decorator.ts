import { BadRequestException, createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { MasterUser } from '../../user/entities/master-user.entity'
import { User } from '../../user/entities/user.entity'

interface RequestOrganizationOptions {
  /**
   * If a UnauthorizedException should be throw if a organization
   * id cant be found on the request context
   */
  failOnNotFound?: boolean
}

export function requestOrganization(options: RequestOrganizationOptions = { failOnNotFound: true }, ctx: ExecutionContext): number | null {
  const isGraphqlContext = ctx.getType<GqlContextType>() === 'graphql'

  const { user, headers } = isGraphqlContext ? GqlExecutionContext.create(ctx).getContext().req : ctx.switchToHttp().getRequest()

  let organizationId: number | null = null

  if (user instanceof User) {
    organizationId = user.organization.id
  }
  //
  else if (user instanceof MasterUser && headers['organizationid']) {
    const orgId = parseInt(headers['organizationid'])

    if (Number.isNaN(orgId)) {
      throw new BadRequestException('Cannot determine organization for request context, invalid organizationid on request headers')
    }

    organizationId = orgId
  }

  if (options?.failOnNotFound && !organizationId) {
    throw new UnauthorizedException(
      `Could not find a organization for the request context. Are you sending the Bearer token on the auth header ? If you're a master user are you sending a organizationid header ?`
    )
  }

  return organizationId
}

/**
 * Extracts the organization for the request context, if the request contains a regular user, its
 * the organization belongs to, if its a master user then its the organizationId specified on the
 * request headers or null
 *
 * ```ts
 * .@JwtAuthGuard() // Remember to use a guard that populates the request user
 * .@Get('my-route')
 * routeHandler(.@RequestOrganizationId() organizationId: number) {
 *   return `This request data should only access data from organization ${organizationId}`
 * }
 * ```
 */
export const RequestOrganizationId = createParamDecorator(requestOrganization)
