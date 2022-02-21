import { UnregisteredUserRepository } from '../repositories/unregistered-user.repository'
import { createRepositoryMock } from '../../../../test/mocks/repository.mock'
import { UnregisteredUserResolver } from './unregistered-user.resolver'
import { createEmptyMocksFor } from '../../../../test/utils/mocking'
import { Test, TestingModule } from '@nestjs/testing'

describe('UnregisteredUserResolver', () => {
  let repository: UnregisteredUserRepository
  let resolver: UnregisteredUserResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnregisteredUserResolver, ...createEmptyMocksFor([UnregisteredUserRepository], createRepositoryMock)]
    }).compile()

    resolver = module.get(UnregisteredUserResolver)
    repository = module.get(UnregisteredUserRepository)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
    expect(repository).toBeDefined()
  })

  it('[user] finds the user by uuid', async () => {
    const userMock = { id: 1 }
    const uuid = 'abc'

    const findOneSpy = jest.spyOn(repository, 'findOneOrFail').mockImplementationOnce(async () => userMock as any)

    const user = await resolver.unregisteredUser(uuid)

    expect(user).toBe(userMock)
    expect(findOneSpy).toHaveBeenCalledTimes(1)
    expect(findOneSpy).toHaveBeenLastCalledWith({ uuid })
  })
})
