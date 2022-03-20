import { IsVehiclePlate } from './is-vehicle-plate.validator'
import { validateSync } from 'class-validator'

class Test {
  @IsVehiclePlate()
  plate?: unknown
}

function testValuesAndGetValidationErrors(plate: string) {
  const test = new Test()
  test.plate = plate
  return validateSync(test)
}

describe('IsVehiclePlate validator', () => {
  it('Accepts old pattern vehicle plates', () => {
    expect(testValuesAndGetValidationErrors('ABC9212').length).toBe(0)
    expect(testValuesAndGetValidationErrors('ZZZ1111').length).toBe(0)
    expect(testValuesAndGetValidationErrors('XYZ1132').length).toBe(0)
  })

  it('Accepts new mercosul pattern vehicle plates', () => {
    expect(testValuesAndGetValidationErrors('XXX1A22').length).toBe(0)
    expect(testValuesAndGetValidationErrors('ZZZ2B33').length).toBe(0)
  })

  it('Fails on invalid values', () => {
    expect(testValuesAndGetValidationErrors('XXX-X222').length).toBe(1)
    expect(testValuesAndGetValidationErrors('ZZZ-2111').length).toBe(1)
    expect(testValuesAndGetValidationErrors(1 as any).length).toBe(1)
  })
})
