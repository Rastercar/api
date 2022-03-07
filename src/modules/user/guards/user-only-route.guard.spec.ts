import { createExecutionContextMock } from '../../../../test/mocks/execution-context.mock'
import { UserOnlyGuard } from './user-only-route.guard'
import { UnauthorizedException } from '@nestjs/common'
import * as httpMock from 'node-mocks-http'

describe('[GUARD] User only', () => {
  let req: httpMock.MockRequest<any>
  let guard: UserOnlyGuard

  beforeEach(() => {
    guard = new UserOnlyGuard()
    req = httpMock.createRequest()
  })

  it('Fails if request user is not set', () => {
    const context = createExecutionContextMock(req)

    return expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('Fails if request user is of type MasterUser', () => {
    req.user = createFakeMasterUser(true)
    const context = createExecutionContextMock(req)

    return expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('Pass if request user is of type User', () => {
    const context = createExecutionContextMock(req)

    return expect(guard.canActivate(context)).toBe(true)
  })
})
