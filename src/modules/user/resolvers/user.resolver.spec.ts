import { Test, TestingModule } from '@nestjs/testing'
import { UserResolver } from './user.resolver'
import { UserService } from '../user.service'
import { OrmModule } from '../../../database/orm.module'

describe('UserResolver', () => {
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
              findOneOrFail: jest.fn()
            }
          })
        }
      ],
      imports: [OrmModule]
    }).compile()

    resolver = module.get(UserResolver)
    userService = module.get(UserService)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
    expect(userService).toBeDefined()
  })

  it('[user] finds the user by id', async () => {
    const userMock = { id: 1 }
    const id = 123

    const findOneSpy = jest.spyOn(userService.userRepository, 'findOneOrFail').mockImplementationOnce(async () => userMock as any)

    const user = await resolver.user(id, [])

    expect(user).toBe(userMock)
    expect(findOneSpy).toHaveBeenCalledTimes(1)
    expect(findOneSpy).toHaveBeenLastCalledWith({ id }, expect.anything())
  })
})
