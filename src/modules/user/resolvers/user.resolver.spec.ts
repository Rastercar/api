import { MasterUserFactory } from '../../../database/seeders/master-user.seeder'
import { createRepositoryMock } from '../../../../test/mocks/repository.mock'
import { MasterUserService } from '../services/master-user.service'
import { UserFactory } from '../../../database/seeders/user.seeder'
import { OrmModule } from '../../../database/orm.module'
import { UserService } from '../services/user.service'
import { Test, TestingModule } from '@nestjs/testing'
import { Loaded, MikroORM } from '@mikro-orm/core'
import { User } from '../entities/user.entity'
import { UserResolver } from './user.resolver'

describe('UserResolver', () => {
  let masterUserService: MasterUserService
  let masterUserFactory: MasterUserFactory
  let userFactory: UserFactory
  let userService: UserService
  let resolver: UserResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useFactory: () => ({ userRepository: createRepositoryMock() })
        },
        {
          provide: MasterUserService,
          useFactory: () => ({ masterUserRepository: createRepositoryMock() })
        }
      ],
      imports: [OrmModule]
    }).compile()

    const em = module.get(MikroORM).em

    resolver = module.get(UserResolver)
    userService = module.get(UserService)
    masterUserService = module.get(MasterUserService)

    userFactory = new UserFactory(em)
    masterUserFactory = new MasterUserFactory(em)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
    expect(userService).toBeDefined()
    expect(masterUserService).toBeDefined()

    expect(userFactory).toBeDefined()
    expect(masterUserFactory).toBeDefined()
  })

  describe('[me]', () => {
    it('just returns the user extracted by the CurrentUser guard', async () => {
      const userMock = userFactory.makeOne()
      let result = await resolver.me(userMock, [])
      expect(result).toBe(userMock)
    })

    it('only queries the field correponding to the user type returned by the CurrentUser guard', async () => {
      const userMock = userFactory.makeOne() as Loaded<User, string>
      userMock.id = 1

      const findUserSpy = jest.spyOn(userService.userRepository, 'findOneOrFail').mockImplementation(async () => userMock)
      // masterAccessLevel should get filtered as it belongs only to master users
      let result = await resolver.me(userMock, ['accessLevel', 'masterAccessLevel'])
      expect(result).toBe(userMock)
      expect(findUserSpy).toHaveBeenLastCalledWith({ id: userMock.id }, { populate: ['accessLevel'] })

      const masterUserMock = masterUserFactory.makeOne()
      masterUserMock.id = 2
      const findMasterUserSpy = jest
        .spyOn(masterUserService.masterUserRepository, 'findOneOrFail')
        .mockImplementation(async () => masterUserMock)

      // organization should get filtered as it belongs only to regular users
      result = await resolver.me(masterUserMock, ['organization', 'masterAccessLevel'])
      expect(result).toBe(masterUserMock)
      expect(findMasterUserSpy).toHaveBeenLastCalledWith({ id: masterUserMock.id }, { populate: ['masterAccessLevel'] })
    })
  })

  describe('[user]', () => {
    it('finds the user by id', async () => {
      const userMock = userFactory.makeOne() as Loaded<User, string>
      const id = 123

      const findOneSpy = jest.spyOn(userService.userRepository, 'findOne').mockImplementationOnce(async () => userMock)

      const user = await resolver.user(id, [])

      expect(user).toBe(userMock)
      expect(findOneSpy).toHaveBeenCalledTimes(1)
      expect(findOneSpy).toHaveBeenLastCalledWith({ id }, expect.anything())
    })
  })
})
