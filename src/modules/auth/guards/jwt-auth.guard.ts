import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(ctx: ExecutionContext) {
    const isGqlContext = ctx.getType<GqlContextType>() === 'graphql'
    return isGqlContext ? GqlExecutionContext.create(ctx).getContext().req : ctx.switchToHttp().getRequest()
  }
}
