import { applyDecorators, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

export function userAuthFactory(): (ClassDecorator & MethodDecorator)[] {
  // We can add more guards as needed here
  return [UseGuards(JwtAuthGuard)]
}

export function UserAuth() {
  return applyDecorators(...userAuthFactory())
}
