import { RequiredProps } from './require-other-prop.validator'
import { validate, ValidationError } from 'class-validator'

export class Test {
  required_prop?: unknown

  @RequiredProps([{ prop: 'required_prop' }])
  common_prop?: unknown
}

export class AdvancedTest {
  required_prop?: unknown

  @RequiredProps([{ prop: 'required_prop', value: 'i_will_match' }])
  common_prop?: unknown
}

interface TestHelperArgs {
  classToTest: typeof Test | typeof AdvancedTest
  required_prop?: unknown
  common_prop?: unknown
}

async function testValuesAndGetValidationErrors(args: TestHelperArgs) {
  const test = new args.classToTest()

  if (args.common_prop) test.common_prop = args.common_prop
  if (args.required_prop) test.required_prop = args.required_prop

  return validate(test)
}

describe('RequireOtherProp validator', () => {
  it('Pass when prop that would require another prop is not set, regardless of the required prop value', async () => {
    let validationErrors = await testValuesAndGetValidationErrors({ classToTest: Test })
    expect(validationErrors.length).toBe(0)

    validationErrors = await testValuesAndGetValidationErrors({ classToTest: Test, required_prop: 1 })
    expect(validationErrors.length).toBe(0)

    validationErrors = await testValuesAndGetValidationErrors({ classToTest: Test, required_prop: 'abc' })
    expect(validationErrors.length).toBe(0)
  })

  it('Pass when required_prop is set', async () => {
    const validationErrors = await testValuesAndGetValidationErrors({ classToTest: Test, required_prop: 10, common_prop: 9 })
    expect(validationErrors.length).toBe(0)
  })

  it('Pass when required_prop is supplied but and matches the specified value', async () => {
    const validationErrors = await testValuesAndGetValidationErrors({
      classToTest: AdvancedTest,
      common_prop: 10,
      required_prop: 'i_will_match'
    })
    expect(validationErrors[0]).not.toBeInstanceOf(ValidationError)
  })

  it('Fails when required_prop is not supplied', async () => {
    const validationErrors = await testValuesAndGetValidationErrors({ classToTest: Test, common_prop: 10 })
    expect(validationErrors[0]).toBeInstanceOf(ValidationError)
  })

  it('Fails when required_prop is supplied but does not match the specified value', async () => {
    const validationErrors = await testValuesAndGetValidationErrors({
      classToTest: AdvancedTest,
      common_prop: 10,
      required_prop: 'i_wont_match'
    })
    expect(validationErrors[0]).toBeInstanceOf(ValidationError)
  })
})
