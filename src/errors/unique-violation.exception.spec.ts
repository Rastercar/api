import { UniqueViolationException } from './unique-violation.exception'

describe('UniqueViolationException', () => {
  it('Properly sets the error code', () => {
    expect(new UniqueViolationException('id').message).toBe('[NOT_UNIQUE__id]')
    expect(new UniqueViolationException('xd').message).toBe('[NOT_UNIQUE__xd]')
    expect(new UniqueViolationException('meme').message).toBe('[NOT_UNIQUE__meme]')
  })
})
