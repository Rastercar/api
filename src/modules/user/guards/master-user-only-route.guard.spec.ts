import { createExecutionContextMock } from '../../../../test/mocks/execution-context.mock'
import { createFakeMasterUser } from '../../../database/postgres/factories/master-user.factory'
import { createFakeUser } from '../../../database/postgres/factories/user.factory'
import { MasterUserOnlyGuard } from './master-user-only-route.guard'
import { UnauthorizedException } from '@nestjs/common'
import * as httpMock from 'node-mocks-http'

describe('[GUARD] Master user only', () => {
  let req: httpMock.MockRequest<any>
  let guard: MasterUserOnlyGuard

  beforeEach(() => {
    guard = new MasterUserOnlyGuard()
    req = httpMock.createRequest()
  })

  it('Fails if request user is not set', () => {
    const context = createExecutionContextMock(req)

    return expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('Fails if request user is of type User', () => {
    req.user = createFakeUser(true)
    const context = createExecutionContextMock(req)

    return expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('Pass if request user is of type MasterUser', () => {
    req.user = createFakeMasterUser(true)
    const context = createExecutionContextMock(req)

    return expect(guard.canActivate(context)).toBe(true)
  })
})
