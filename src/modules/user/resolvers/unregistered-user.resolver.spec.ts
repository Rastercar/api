import { UnregisteredUserResolver } from './unregistered-user.resolver'
import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../services/user.service'
import { OrmModule } from '../../../database/orm.module'

describe('UnregisteredUserResolver', () => {
  let service: UserService
  let resolver: UnregisteredUserResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnregisteredUserResolver,
        {
          provide: UserService,
          useFactory: () => ({
            unregisteredUserRepository: {
              findOneOrFail: jest.fn()
            }
          })
        }
      ],
      imports: [OrmModule]
    }).compile()

    service = module.get(UserService)
    resolver = module.get(UnregisteredUserResolver)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(resolver).toBeDefined()
  })

  it('[user] finds the user by uuid', async () => {
    const userMock = { id: 1 }
    const uuid = 'abc'

    const findOneSpy = jest.spyOn(service.unregisteredUserRepository, 'findOneOrFail').mockImplementationOnce(async () => userMock as any)

    const user = await resolver.unregisteredUser(uuid)

    expect(user).toBe(userMock)
    expect(findOneSpy).toHaveBeenCalledTimes(1)
    expect(findOneSpy).toHaveBeenLastCalledWith({ uuid })
  })
})
