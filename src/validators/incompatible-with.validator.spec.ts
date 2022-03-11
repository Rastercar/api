import { IsOptional, validate, ValidationError } from 'class-validator'
import { IncompatableWith } from './incompatible-with.validator'

class Test {
  @IncompatableWith(['evil'])
  good?: boolean

  @IncompatableWith(['good'])
  evil?: boolean
}

class BothOptionalTest {
  @IncompatableWith(['evil'])
  @IsOptional()
  good?: boolean

  @IncompatableWith(['good'])
  @IsOptional()
  evil?: boolean
}

describe('IncompatableWith validator', () => {
  it('Should allow a object where theres no conflicting properties', async () => {
    const test = new Test()
    test.good = true

    const validationErrors = await validate(test)
    expect(validationErrors.length).toBe(0)

    const test2 = new Test()
    test.evil = true

    const validationErrors2 = await validate(test2)
    expect(validationErrors2.length).toBe(0)

    const test3 = new Test()

    const validationErrors3 = await validate(test3)
    expect(validationErrors3.length).toBe(0)
  })

  it('Return validation errors when conflicting properties coexist in a object', async () => {
    const test = new Test()
    test.good = true
    test.evil = true

    const validationErrors = await validate(test)
    expect(validationErrors.length).toBeGreaterThan(0)
    expect(validationErrors[0]).toBeInstanceOf(ValidationError)
  })

  it('Return validation errors when conflicting properties coexist in a object, even if theyre optional', async () => {
    const test = new BothOptionalTest()
    test.good = true
    test.evil = true

    const validationErrors = await validate(test)
    expect(validationErrors.length).toBeGreaterThan(0)
    expect(validationErrors[0]).toBeInstanceOf(ValidationError)
  })
})
