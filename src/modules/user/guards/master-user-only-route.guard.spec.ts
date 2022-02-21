import { createExecutionContextMock } from '../../../../test/mocks/execution-context.mock'
import { MasterUserOnlyGuard } from './master-user-only-route.guard'
import * as httpMock from 'node-mocks-http'
import { UnauthorizedException } from '@nestjs/common'
import { createFakeUser } from '../../../database/seeders/user.seeder'
import { faker } from '@mikro-orm/seeder'
import { User } from '../entities/user.entity'
import { createFakeMasterUser } from '../../../database/seeders/master-user.seeder'
import { MasterUser } from '../entities/master-user.entity'

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
    req.user = new User(createFakeUser(faker) as any)
    const context = createExecutionContextMock(req)

    return expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('Pass if request user is of type MasterUser', () => {
    req.user = new MasterUser(createFakeMasterUser(faker) as any)
    const context = createExecutionContextMock(req)

    return expect(guard.canActivate(context)).toBe(true)
  })
})
