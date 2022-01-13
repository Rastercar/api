import { RegisterUserDTO } from '../modules/auth/dtos/register-user.dto'
import { returnsType } from './coverage-helpers'

it('[returns] returns a function that returns the first arg', () => {
  expect(returnsType(null)()).toBeNull()

  expect(returnsType(undefined)()).toBeUndefined()

  expect(returnsType(123)()).toBe(123)

  expect(returnsType(Boolean)()).toBe(Boolean)

  expect(returnsType(RegisterUserDTO)()).toBe(RegisterUserDTO)
})
