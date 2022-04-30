import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql'
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

const INTERNAL_SERVER_ERROR_SOCKET_CODE = 4500

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
      Object.keys(res).length === 3 &&
      (['message', 'statusCode', 'error'] as const).every(prop => isDefined((res as MessagedExceptionResponse)[prop]))
    )
  }

  /**
   * Handles a expception for a graphql context, closing
   * the websocket found in the context if theres any
   */
  private handleExceptionForGqlContext(exception: HttpException, host: GqlArgumentsHost) {
    const exceptionResponse = exception.getResponse()
    const graphqlContext = host.getArgByIndex(2)

    if (graphqlContext && typeof graphqlContext.socket?.close === 'function') {
      const errorMsg =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, string>)?.message || exception.message || 'Internal Server Error'

      // Very important, `graphql-ws` expected and standard close codes of the GraphQL over WebSocket Protocol
      // return the socket close promise so the library wont close it twice
      return graphqlContext.socket?.close(INTERNAL_SERVER_ERROR_SOCKET_CODE, errorMsg)
    }

    // If we are dealing with a graphql host then the default error wrapper from the apollo driver will
    // wrap the error in a graphql compatible manner
    // see: https://github.com/nestjs/graphql/blob/83b4919a45ce459da31e9c40813ef1f00cd5a43d/lib/utils/merge-defaults.util.ts#L78
    return exception
  }

  catch(exception: HttpException, host: ArgumentsHost): Response<NormalizedErrorResponse> | HttpException {
    const hostType = host.getType<GqlContextType>()

    if (hostType === 'graphql') {
      const gqlArgs = GqlArgumentsHost.create(host)
      return this.handleExceptionForGqlContext(exception, gqlArgs)
    }

    if (hostType !== 'http') return exception

    const exceptionResponse = exception.getResponse()
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
    res = { ...responseObj, message: exceptionResponse, error: exception.name }
    return response.status(status).json(res)
  }
}
