import { UnauthorizedException } from '@nestjs/common'
import { JwtStrategy } from './jwt.strategy'

describe('JWT Strategy', () => {
  const authTokenServiceMock = { getUserFromTokenOrFail: jest.fn() }
  const configServiceMock = { get: jest.fn(() => 'mock') }

  const strategy = new JwtStrategy(configServiceMock as any, authTokenServiceMock as any)

  it('Throws a UnauthorizedException when authTokenService fails', async () => {
    authTokenServiceMock.getUserFromTokenOrFail.mockRejectedValueOnce(new UnauthorizedException())
    return expect(() => strategy.validate({ sub: 'invalid_id-1' })).rejects.toThrow(UnauthorizedException)
  })
})
