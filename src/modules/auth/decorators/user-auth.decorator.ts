import { MasterUserOnlyGuard } from '../../user/guards/master-user-only-route.guard'
import { UserOnlyGuard } from '../../user/guards/user-only-route.guard'
import { applyDecorators, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

/**
 * Checks the request has a valid User JWT and populate request.user
 */
export function UserAuth() {
  return applyDecorators(UseGuards(JwtAuthGuard, UserOnlyGuard))
}

/**
 * Checks the request has a valid MasterUser JWT and populate request.user
 */
export function MasterUserAuth() {
  return applyDecorators(UseGuards(JwtAuthGuard, MasterUserOnlyGuard))
}
