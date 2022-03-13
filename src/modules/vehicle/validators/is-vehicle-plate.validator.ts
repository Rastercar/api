import {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint,
  registerDecorator,
  ValidationOptions
} from 'class-validator'

@ValidatorConstraint({ async: false })
class IsVehiclePlateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    const mercosulRgx = /[A-Za-z]{3}[0-9][A-Za-z][0-9]{2}/
    const oldRgx = /[A-Za-z]{3}[0-9]{4}/

    if (!value || typeof value !== 'string') return false

    return oldRgx.test(value) || mercosulRgx.test(value)
  }

  defaultMessage({ property }: ValidationArguments) {
    return `${property} is not a valid vehicle plate.`
  }
}

/**
 * Checks if this prop value a valid vehicle plate by the new mercosul or old pattern
 */
export function IsVehiclePlate(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsVehiclePlate',
      target: object.constructor,
      options: validationOptions,
      propertyName: propertyName,
      validator: IsVehiclePlateConstraint
    })
  }
}
