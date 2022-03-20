import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import { JwtAuthGuard } from './jwt-auth.guard'
import httpMock from 'node-mocks-http'
import { GqlExecutionContext } from '@nestjs/graphql'

describe('[GUARD] JwtAuthGuard', () => {
  let guard: JwtAuthGuard
  let req: any

  beforeEach(() => {
    guard = new JwtAuthGuard()
    req = httpMock.createRequest()
  })

  it('Get the request from HTTP and Graphql contexts', () => {
    const ctx = new ExecutionContextHost([req])

    const createGqlCtxSpy = jest.spyOn(GqlExecutionContext, 'create').mockImplementationOnce(() => ({ getContext: () => ({ req }) } as any))
    const getHttpReqSpy = jest.spyOn(ctx, 'switchToHttp')

    guard.getRequest(ctx)

    expect(getHttpReqSpy).toHaveBeenCalled()
    expect(createGqlCtxSpy).not.toHaveBeenCalled()

    jest.spyOn(ctx, 'getType').mockImplementationOnce(() => 'graphql')

    guard.getRequest(ctx)

    expect(createGqlCtxSpy).toHaveBeenCalled()
  })
})
