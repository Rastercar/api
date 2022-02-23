import { createFakeMasterUser } from '../../../database/seeders/master-user.seeder'
import { createRepositoryMock } from '../../../../test/mocks/repository.mock'
import { createFakeUser } from '../../../database/seeders/user.seeder'
import { JwtEmailStrategy } from './jwt-email.strategy'
import { UnauthorizedException } from '@nestjs/common'
import { faker } from '@mikro-orm/seeder'

describe('JWT Email Strategy', () => {
  const configServiceMock = { get: jest.fn(() => 'mock') }

  const masterUserRepository = createRepositoryMock()
  const userRepository = createRepositoryMock()

  const strategy = new JwtEmailStrategy(configServiceMock as any, userRepository as any, masterUserRepository as any)

  it('Finds the user or master user by the email supplied in the token sub (subject)', async () => {
    const masterUserMock = createFakeMasterUser(faker)
    const userMock = createFakeUser(faker)

    const sub = 'email@gmail.com'

    userRepository.findOne.mockImplementationOnce(async () => userMock)
    const user = await strategy.validate({ sub })

    expect(user).toEqual(userMock)
    expect(userRepository.findOne).toHaveBeenLastCalledWith({ email: sub })

    // ---

    masterUserRepository.findOne.mockImplementationOnce(async () => masterUserMock)
    const masterUser = await strategy.validate({ sub })

    expect(masterUser).toEqual(masterUserMock)
    expect(masterUserRepository.findOne).toHaveBeenLastCalledWith({ email: sub })
  })

  it('Throws a UnauthorizedException when no user or master user is found', async () => {
    return expect(() => strategy.validate({ sub: 'random_email@gmail.com' })).rejects.toThrow(UnauthorizedException)
  })
})
