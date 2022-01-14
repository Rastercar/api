import { LocalStrategy } from './local.strategy'

it('Validates the user with its credentials', async () => {
  const email = 'mock@gmail.com'
  const password = '12345'

  const userMock = { id: 1 }

  const authServiceMock = {
    validateUserByCredentials: jest.fn(async () => userMock)
  }

  const strategy = new LocalStrategy(authServiceMock as any)

  const user = await strategy.validate(email, password)

  expect(user).toEqual(userMock)
  expect(authServiceMock.validateUserByCredentials).toHaveBeenLastCalledWith({ email, password })
})
