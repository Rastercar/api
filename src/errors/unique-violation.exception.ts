import { BadRequestException } from '@nestjs/common'

export class UniqueViolationException extends BadRequestException {
  /**
   * A exception to be throw when a request violated/would violate a unique constraint
   */
  constructor(column: string) {
    super(`[NOT_UNIQUE__${column}]`)
  }
}
