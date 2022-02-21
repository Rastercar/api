import { createExecutionContextMock } from '../../../../test/mocks/execution-context.mock'
import { createFakeMasterUser } from '../../../database/seeders/master-user.seeder'
import { createFakeUser } from '../../../database/seeders/user.seeder'
import { MasterUser } from '../entities/master-user.entity'
import { UserOnlyGuard } from './user-only-route.guard'
import { UnauthorizedException } from '@nestjs/common'
import { User } from '../entities/user.entity'
import * as httpMock from 'node-mocks-http'
import { faker } from '@mikro-orm/seeder'

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
    req.user = new MasterUser(createFakeMasterUser(faker) as any)
    const context = createExecutionContextMock(req)

    return expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('Pass if request user is of type User', () => {
    req.user = new User(createFakeUser(faker) as any)
    const context = createExecutionContextMock(req)

    return expect(guard.canActivate(context)).toBe(true)
  })
})
