import { HttpExceptionFilter } from '../filters/http-exception.filter'
import { INestApplication, ValidationPipe } from '@nestjs/common'

/**
 * Setups the nest aplication global middlewares, settings, pipes, etc.
 */
export const setupAppGlobals = (app: INestApplication) => {
  app.enableCors({ credentials: true })

  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true }))
}
