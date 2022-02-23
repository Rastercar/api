import { createFakeMasterUser } from '../../../database/seeders/master-user.seeder'
import { createRepositoryMock } from '../../../../test/mocks/repository.mock'
import { createFakeUser } from '../../../database/seeders/user.seeder'
import { UnauthorizedException } from '@nestjs/common'
import { JwtStrategy } from './jwt.strategy'
import { faker } from '@mikro-orm/seeder'

describe('JWT Strategy', () => {
  const configServiceMock = {
    get: jest.fn(() => 'mock')
  }

  const masterUserRepository = createRepositoryMock()
  const userRepository = createRepositoryMock()

  const strategy = new JwtStrategy(configServiceMock as any, userRepository as any, masterUserRepository as any)
  const subject = 'user-1'

  it('Finds the user by the id supplied in the token sub (subject)', async () => {
    const userMock = createFakeUser(faker)
    userMock.id = 1

    userRepository.findOne.mockImplementationOnce(async () => userMock)
    const user = await strategy.validate({ sub: 'user-1' })

    expect(user).toEqual(userMock)
    expect(masterUserRepository.findOne).not.toHaveBeenCalled()
    expect(userRepository.findOne).toHaveBeenLastCalledWith({ id: 1 })

    // ---

    userRepository.findOne.mockClear()

    const masterUserMock = createFakeMasterUser(faker)
    masterUserMock.id = 1

    masterUserRepository.findOne.mockImplementationOnce(async () => masterUserMock)
    const masterUser = await strategy.validate({ sub: 'masteruser-1' })

    expect(masterUser).toEqual(masterUserMock)
    expect(userRepository.findOne).not.toHaveBeenCalled()
    expect(masterUserRepository.findOne).toHaveBeenLastCalledWith({ id: 1 })
  })

  it('Throws a UnauthorizedException when the token subject is not a valid user', async () => {
    userRepository.findOne.mockImplementationOnce(async () => null)

    return expect(() => strategy.validate({ sub: subject })).rejects.toThrow(UnauthorizedException)
  })

  it('Throws a UnauthorizedException when the token subject is not a valid identifier', async () => {
    // validate expects 'user-{id}' or 'masteruser-{id}', this should fail
    return expect(() => strategy.validate({ sub: '1' })).rejects.toThrow(UnauthorizedException)
  })
})
