import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../user/user.service'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let userService: UserService
  let authService: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useFactory: () => ({})
        },
        {
          provide: UserService,
          useFactory: () => ({})
        }
      ]
    }).compile()

    authService = module.get(AuthService)
    userService = module.get(UserService)
  })

  it('should be defined', () => {
    expect(authService).toBeDefined()
    expect(userService).toBeDefined()
  })
})
