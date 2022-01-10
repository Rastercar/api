import { UnauthorizedException } from '@nestjs/common'
import { GoogleAuthGuard } from './google-auth.guard'

describe('[GUARD] Google auth guard', () => {
  let guard: GoogleAuthGuard

  beforeEach(() => {
    guard = new GoogleAuthGuard()
  })

  it('Throws a unauthorized exception when the google strategy fails, instead of a non http exception', () => {
    const errorMock = new Error('im mocking a error throw by google oauth strategy')
    return expect(() => guard.handleRequest(errorMock, {})).toThrow(UnauthorizedException)
  })

  it('Proceeds returning the user on success', async () => {
    const userMock = { id: 1 }
    const resul = await guard.handleRequest(null, userMock)

    return expect(resul).toBe(userMock)
  })
})
