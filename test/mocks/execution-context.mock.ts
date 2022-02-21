import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'

/**
 * Creates a execution context mock, util for testing guards
 *
 * @param req Request mockada (ex: httpMock.createRequest())
 *
 * @see https://docs.nestjs.com/fundamentals/execution-context
 */
export function createExecutionContextMock(req: any) {
  class Test {
    handler() {
      //
    }
  }
  return new ExecutionContextHost([req], Test, new Test().handler)
}
