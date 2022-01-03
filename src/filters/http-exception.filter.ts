import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { isDefined } from 'class-validator'
import { Response } from 'express'

interface StandardExceptionResponse {
  statusCode: HttpStatus
  message: string
}

interface MessagedExceptionResponse extends StandardExceptionResponse {
  error: string
}

interface NormalizedErrorResponse {
  error: string
  message?: any
  timestamp: string
  statusCode: HttpStatus
  isRastercarApiError: true
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Checks if its a standard error, containing only statusCode and message, this occours
   * whenever an exception is fired with no arguments. ex: new ForbiddenException()
   */
  private isStandardExceptionResponse(res: string | Record<string, any>): res is StandardExceptionResponse {
    if (typeof res === 'string') return false

    const casted = res as StandardExceptionResponse
    return Object.keys(casted).length === 2 && isDefined(casted.message) && isDefined(casted.statusCode)
  }

  /**
   * Checks if its an error with only one message, occours whenever an error is thrown
   * with a string as the constructor argument. ex: new ForbiddenException('Invalid password')
   */
  private isMessagedExceptionResponse(res: string | Record<string, any>): res is MessagedExceptionResponse {
    if (typeof res === 'string') return false

    return (
      Object.keys(res).length === 3 && ['message', 'statusCode', 'error'].every(prop => isDefined((res as MessagedExceptionResponse)[prop]))
    )
  }

  catch(exception: HttpException, host: ArgumentsHost): Response<NormalizedErrorResponse> | HttpException {
    const exceptionResponse = exception.getResponse()

    if (host.getType() !== 'http') return exception

    const response = host.switchToHttp().getResponse<Response>()
    const status = exception.getStatus()

    const responseObj = {
      statusCode: status,
      isRastercarApiError: true as const,
      timestamp: new Date().toISOString()
    }

    let res!: NormalizedErrorResponse

    // Whenever its a standard exception nestjs puts the error name in the message prop
    // we want the message prop to be a description of the error, not its name
    if (this.isStandardExceptionResponse(exceptionResponse)) {
      res = { ...responseObj, error: exception.message }
      return response.status(status).json(res)
    }

    if (this.isMessagedExceptionResponse(exceptionResponse)) {
      const { error, message } = exceptionResponse
      res = { ...responseObj, error, message }
      return response.status(status).json(res)
    }

    // Whenever there is only a message the error type is unknown, so we
    // should explicitely inform the consumer
    res = { ...responseObj, message: exceptionResponse, error: 'Unknown' }
    return response.status(status).json(res)
  }
}
