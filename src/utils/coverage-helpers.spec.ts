import { RegisterUserDTO } from '../modules/auth/dtos/register-user.dto'
import { returns } from './coverage-helpers'

it('[returns] returns a function that returns the first arg', () => {
  expect(returns(null)()).toBeNull()

  expect(returns(undefined)()).toBeUndefined()

  expect(returns(123)()).toBe(123)

  expect(returns(Boolean)()).toBe(Boolean)

  expect(returns(RegisterUserDTO)()).toBe(RegisterUserDTO)
})
