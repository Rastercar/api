import { GqlExecutionContext } from '@nestjs/graphql'
import { GqlAuthGuard } from './gql-jwt-auth.guard'
import * as httpMock from 'node-mocks-http'

describe('[GUARD] Gql auth guard', () => {
  let guard: GqlAuthGuard

  beforeEach(() => {
    guard = new GqlAuthGuard()
  })

  it('Gets the request apropriately for the graphql context', () => {
    const req = httpMock.createRequest()

    const gqlContextMock = { getContext: () => ({ req }) }

    jest.spyOn(GqlExecutionContext, 'create').mockImplementationOnce(() => gqlContextMock as any)

    const request = guard.getRequest({} as any)

    return expect(request).toBe(req)
  })
})
