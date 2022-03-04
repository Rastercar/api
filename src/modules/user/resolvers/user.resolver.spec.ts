import { createFakeMasterUser } from '../../../database/factories/master-user.factory'
import { createRepositoryMock } from '../../../../test/mocks/repository.mock'
import { MasterUserRepository } from '../repositories/master-user.repository'
import { createFakeUser } from '../../../database/factories/user.factory'
import { createEmptyMocksFor } from '../../../../test/utils/mocking'
import { MasterUserService } from '../services/master-user.service'
import { UserRepository } from '../repositories/user.repository'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { UserService } from '../services/user.service'
import { Test, TestingModule } from '@nestjs/testing'
import { UserResolver } from './user.resolver'

describe('UserResolver', () => {
  let masterUserRepository: MasterUserRepository
  let masterUserService: MasterUserService
  let userRepository: UserRepository
  let userService: UserService
  let resolver: UserResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        ...createEmptyMocksFor([UserRepository, MasterUserRepository], createRepositoryMock),
        {
          provide: UserService,
          useFactory: () => ({
            updateUser: jest.fn()
          })
        },
        {
          provide: MasterUserService,
          useFactory: () => ({})
        }
      ]
    }).compile()

    resolver = module.get(UserResolver)
    userService = module.get(UserService)
    userRepository = module.get(UserRepository)
    masterUserService = module.get(MasterUserService)
    masterUserRepository = module.get(MasterUserRepository)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
    expect(userService).toBeDefined()
    expect(userRepository).toBeDefined()
    expect(masterUserService).toBeDefined()
    expect(masterUserRepository).toBeDefined()
  })

  describe('[me]', () => {
    it('just returns the user extracted by the CurrentUser guard', async () => {
      const userMock = createFakeUser(true)

      let result = await resolver.me(userMock, [])
      expect(result).toBe(userMock)
    })

    it('only queries the field correponding to the user type returned by the CurrentUser guard', async () => {
      const userMock = createFakeUser(true)
      userMock.id = 1
      const findUserSpy = jest.spyOn(userRepository, 'findOneOrFail').mockImplementation(async () => userMock as any)

      // masterAccessLevel should get filtered as it belongs only to master users
      let result = await resolver.me(userMock, ['accessLevel', 'masterAccessLevel'])
      expect(result).toBe(userMock)
      expect(findUserSpy).toHaveBeenLastCalledWith({ id: userMock.id }, { populate: ['accessLevel'] })

      const masterUserMock = createFakeMasterUser(true)
      masterUserMock.id = 2
      const findMasterUserSpy = jest.spyOn(masterUserRepository, 'findOneOrFail').mockImplementation(async () => masterUserMock as any)

      // organization should get filtered as it belongs only to regular users
      result = await resolver.me(masterUserMock, ['organization', 'masterAccessLevel'])
      expect(result).toBe(masterUserMock)
      expect(findMasterUserSpy).toHaveBeenLastCalledWith({ id: masterUserMock.id }, { populate: ['masterAccessLevel'] })
    })
  })

  describe('[user]', () => {
    it('finds the user by id', async () => {
      const userMock = createFakeUser(true) as any
      const id = 123

      const findOneSpy = jest.spyOn(userRepository, 'findOne').mockImplementationOnce(async () => userMock as any)

      const user = await resolver.user(id, [])

      expect(user).toBe(userMock)
      expect(findOneSpy).toHaveBeenCalledTimes(1)
      expect(findOneSpy).toHaveBeenLastCalledWith({ id }, expect.anything())
    })
  })

  describe('[updateMyProfile]', () => {
    it('updates the profile with userService', async () => {
      const userMock = createFakeUser(true) as any

      const dto = new UpdateUserDTO()
      dto.email = 'new.email@gmail.com'

      const updateSpy = jest.spyOn(userService, 'updateUser')
      jest.spyOn(userRepository, 'findOneOrFail').mockImplementationOnce(async () => userMock as any)
      const user = await resolver.updateMyProfile(userMock, dto, [])

      expect(user).toBe(userMock)
      expect(updateSpy).toHaveBeenCalledTimes(1)
      expect(updateSpy).toHaveBeenLastCalledWith(userMock, dto)
    })
  })
})
