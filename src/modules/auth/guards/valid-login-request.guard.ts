import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common'
import { validateSync as validateDTO } from 'class-validator'
import { LoginDTO } from '../dtos/login.dto'

/**
 * Validates a login request
 *
 * Normally validation logic ocours in validation pipes, but we need to validate
 * the login request before it hits the auth guard (that happens before the pipes)
 * so we pass this validation to a guard.
 */
@Injectable()
export class ValidLoginRequestGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const { body } = request

    const dto = new LoginDTO()

    dto.username = body.username
    dto.password = body.password

    const errors = validateDTO(dto)

    if (errors.length > 0) throw new BadRequestException(errors, 'Invalid Login Request')

    return true
  }
}
