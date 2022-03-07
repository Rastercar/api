import { MasterUserService } from '../services/master-user.service'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { UserService } from '../services/user.service'
import { Test, TestingModule } from '@nestjs/testing'
import { UserResolver } from './user.resolver'

describe('UserResolver', () => {
  let masterUserService: MasterUserService
  let userService: UserService
  let resolver: UserResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
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
    masterUserService = module.get(MasterUserService)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
    expect(userService).toBeDefined()
    expect(masterUserService).toBeDefined()
  })

  describe('[me]', () => {
    it('just returns the user extracted by the CurrentUser guard', async () => {
      const userMock = createFakeUser(true)

      const result = await resolver.me(userMock, [])
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
