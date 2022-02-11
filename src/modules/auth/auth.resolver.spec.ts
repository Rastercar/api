import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../user/services/user.service'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { LoginInput } from './dtos/login.dto'
import { RegisterUserDTO } from './dtos/register-user.dto'

describe('AuthResolver', () => {
  let userService: UserService
  let authService: AuthService
  let resolver: AuthResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useFactory: () => ({
            login: jest.fn(),
            loginWithToken: jest.fn(),
            checkEmailAddressInUse: jest.fn(),
            validateUserByCredentials: jest.fn()
          })
        },
        {
          provide: UserService,
          useFactory: () => ({
            registerUser: jest.fn()
          })
        }
      ]
    }).compile()

    resolver = module.get(AuthResolver)
    authService = module.get(AuthService)
    userService = module.get(UserService)
  })

  const userMock = { id: 1 }
  const authServiceLoginRes = { user: userMock, token: { type: 'bearer', value: '112379812asdasd1278' } }

  it('should be defined', () => {
    expect(resolver).toBeDefined()
    expect(authService).toBeDefined()
    expect(userService).toBeDefined()
  })

  it('[me] just returns the user extracted by the CurrentUser guard', () => {
    expect(resolver.me(userMock as any)).toBe(userMock)
  })

  it('[isEmailInUse] just checks if email is in use using the authService', async () => {
    const checkSpy = jest.spyOn(authService, 'checkEmailAddressInUse').mockImplementationOnce(async () => false)
    const res = await resolver.isEmailInUse('mock_email@gmail.com')

    expect(checkSpy).toHaveBeenLastCalledWith('mock_email@gmail.com')
    expect(typeof res).toBe('boolean')
  })

  it('[login] validates the user credentials and logs him in if valid', async () => {
    const credentials: LoginInput = { email: 'mock@gmail.com', password: '12345' }

    const validateSpy = jest.spyOn(authService, 'validateUserByCredentials').mockImplementationOnce(async () => userMock as any)
    const loginSpy = jest.spyOn(authService, 'login').mockImplementationOnce(async () => authServiceLoginRes as any)
    const loginRes = await resolver.login(credentials)

    expect(validateSpy).toHaveBeenLastCalledWith(credentials)
    expect(loginSpy).toHaveBeenLastCalledWith(userMock)
    expect(loginRes).toBe(authServiceLoginRes)
  })

  it('[loginWithToken] logs the user with the provided token with the authService', async () => {
    const token = '12345abcde'

    const loginWithTokenSpy = jest.spyOn(authService, 'loginWithToken').mockImplementationOnce(async () => authServiceLoginRes as any)
    const loginRes = await resolver.loginWithToken(token)

    expect(loginWithTokenSpy).toHaveBeenLastCalledWith(token)
    expect(loginRes).toBe(authServiceLoginRes)
  })

  describe('[register]', () => {
    const registerDto: RegisterUserDTO = {
      username: 'username',
      password: '12345',
      email: 'mail@gmail.com',
      refersToUnregisteredUser: null
    }

    it('throws a BadRequestException when the email is in use', () => {
      jest.spyOn(authService, 'checkEmailAddressInUse').mockImplementationOnce(async () => true)
      return expect(() => resolver.register(registerDto)).rejects.toThrow(BadRequestException)
    })

    it('registers the user with the userService', async () => {
      const registerSpy = jest.spyOn(userService, 'registerUser').mockImplementationOnce(async () => userMock as any)
      await resolver.register(registerDto)
      expect(registerSpy).toHaveBeenLastCalledWith(registerDto)
    })

    it('logs in the registered user, without updating his lastLogin date', async () => {
      const registerSpy = jest.spyOn(userService, 'registerUser').mockImplementationOnce(async () => userMock as any)
      const loginSpy = jest.spyOn(authService, 'login').mockImplementationOnce(async () => authServiceLoginRes as any)

      const registerRes = await resolver.register(registerDto)

      expect(registerSpy).toHaveBeenLastCalledWith(registerDto)
      expect(loginSpy).toHaveBeenLastCalledWith(userMock, { setLastLogin: false })
      expect(registerRes).toBe(authServiceLoginRes)
    })
  })
})
