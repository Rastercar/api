import { User } from '../modules/user/entities/user.entity'
import { isUniqueValidator } from './is-unique.validator'

describe('IsUniqueWith validator', () => {
  const validator = new isUniqueValidator({ findOne: jest.fn() } as any)

  it('Pass if there is no existing record for entity with column value and fails otherwise', async () => {
    jest.spyOn(validator.em, 'findOne').mockImplementationOnce(async () => null)
    const result = await validator.validate('meme@gmail.com', { constraints: [{ entity: User, column: 'email' }] } as any)
    expect(result).toBe(true)

    jest.spyOn(validator.em, 'findOne').mockImplementationOnce(async () => ({ id: 1 }))
    const result2 = await validator.validate('meme@gmail.com', { constraints: [{ entity: User, column: 'email' }] } as any)
    expect(result2).toBe(false)
  })

  it('Starts the error message with [NOT_UNIQUE__<column>]', async () => {
    jest.spyOn(validator.em, 'findOne').mockImplementationOnce(async () => ({ id: 1 }))
    const msg = validator.defaultMessage({ constraints: [{ entity: User, column: 'email' }] } as any)

    expect(msg.startsWith('[NOT_UNIQUE__email]')).toBe(true)
  })
})
