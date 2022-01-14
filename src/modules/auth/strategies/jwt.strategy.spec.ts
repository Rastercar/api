import { UnauthorizedException } from '@nestjs/common'
import { JwtStrategy } from './jwt.strategy'

describe('JWT Strategy', () => {
  const userMock = { id: 1 }

  const configServiceMock = {
    get: jest.fn(() => 'mock')
  }

  const userServiceMock = {
    userRepository: {
      findOne: jest.fn(async () => userMock as any)
    }
  }

  const strategy = new JwtStrategy(configServiceMock as any, userServiceMock as any)
  const subject = 1

  it('Finds the user by search it by the id supplied in the token sub (subject)', async () => {
    const user = await strategy.validate({ sub: subject })

    expect(user).toEqual(userMock)
    expect(userServiceMock.userRepository.findOne).toHaveBeenLastCalledWith({ id: subject })
  })

  it('Throws a UnauthorizedException when the token subject is not a valid user', async () => {
    userServiceMock.userRepository.findOne.mockImplementationOnce(async () => null)

    return expect(() => strategy.validate({ sub: subject })).rejects.toThrow(UnauthorizedException)
  })
})
