import { registerDecorator, ValidationOptions } from 'class-validator'

/**
 * Test if the property is a valid phone number in the E164 format
 */
export function IsE164PhoneNumber(validationOptions?: ValidationOptions): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string | symbol) {
    registerDecorator({
      name: 'isE164PhoneNumber',
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!value || typeof value !== 'string') return false

          const E164Regex = /^\+[1-9]\d{10,14}$/

          return E164Regex.test(value)
        }
      }
    })
  }
}
