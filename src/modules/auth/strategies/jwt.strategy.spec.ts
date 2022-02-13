import { createRepositoryMock } from '../../../../test/mocks/repository.mock'
import { createFakeUser } from '../../../database/seeders/user.seeder'
import { UnauthorizedException } from '@nestjs/common'
import { JwtStrategy } from './jwt.strategy'
import { faker } from '@mikro-orm/seeder'

describe('JWT Strategy', () => {
  const userMock = createFakeUser(faker)
  userMock.id = 1

  const configServiceMock = {
    get: jest.fn(() => 'mock')
  }

  const userServiceMock = {
    userRepository: {
      ...createRepositoryMock(),
      ...{
        findOne: jest.fn(async () => userMock as any)
      }
    }
  }

  const masterUserServiceMock = {
    ...createRepositoryMock(),
    ...{
      findOne: jest.fn(async () => userMock as any)
    }
  }

  const strategy = new JwtStrategy(configServiceMock as any, userServiceMock as any, masterUserServiceMock as any)
  const subject = 'user-1'

  it('Finds the user by search it by the id supplied in the token sub (subject)', async () => {
    const user = await strategy.validate({ sub: subject })

    expect(user).toEqual(userMock)
    expect(userServiceMock.userRepository.findOne).toHaveBeenLastCalledWith({ id: 1 })
  })

  it('Throws a UnauthorizedException when the token subject is not a valid user', async () => {
    userServiceMock.userRepository.findOne.mockImplementationOnce(async () => null)

    return expect(() => strategy.validate({ sub: subject })).rejects.toThrow(UnauthorizedException)
  })
})
