import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const CurrentUser = createParamDecorator((prop: string, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context)
  const { user } = ctx.getContext().req

  if (!user) throw new UnauthorizedException('Cannot get request user')

  return prop ? user[prop] : user
})
