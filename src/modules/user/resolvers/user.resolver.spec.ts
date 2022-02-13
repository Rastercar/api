import { Test, TestingModule } from '@nestjs/testing'
import { UserResolver } from './user.resolver'
import { UserService } from '../services/user.service'
import { OrmModule } from '../../../database/orm.module'
import { MasterUserService } from '../services/master-user.service'

describe.only('UserResolver', () => {
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
            userRepository: {
              findOne: jest.fn()
            }
          })
        },
        {
          provide: MasterUserService,
          useFactory: () => ({
            masterUserRepository: {
              findOne: jest.fn()
            }
          })
        }
      ],
      imports: [OrmModule]
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

  it('[me] just returns the user extracted by the CurrentUser guard', async () => {
    const userMock = { id: 1 }
    const result = await resolver.me(userMock as any, [])
    expect(result).toBe(userMock)
  })

  it('[user] finds the user by id', async () => {
    const userMock = { id: 1 }
    const id = 123

    const findOneSpy = jest.spyOn(userService.userRepository, 'findOne').mockImplementationOnce(async () => userMock as any)

    const user = await resolver.user(id, [])

    expect(user).toBe(userMock)
    expect(findOneSpy).toHaveBeenCalledTimes(1)
    expect(findOneSpy).toHaveBeenLastCalledWith({ id }, expect.anything())
  })
})
