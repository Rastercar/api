import {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint,
  ValidationOptions,
  registerDecorator
} from 'class-validator'

interface PropVal {
  /**
   * Name of the required property
   */
  prop: string
  /**
   * The value the prop must have, if the value is
   * not set, it checks if the value is !== undefined
   */
  value?: any
}

@ValidatorConstraint({ async: false })
class RequireOtherPropConstraint implements ValidatorConstraintInterface {
  validate(value: any, { constraints, object }: ValidationArguments) {
    if (!value) return true

    const requiredProps: PropVal[] = constraints

    return requiredProps.every(({ prop, value }) => (value === undefined ? object[prop] !== undefined : object[prop] === value))
  }

  defaultMessage({ property, constraints }: ValidationArguments) {
    const requiredPropsDescription = constraints
      .map((c: PropVal) => {
        if (c.value !== undefined) return `${c.prop} to be ${c.value}`
        return `${c.prop} to be defined`
      })
      .join(', ')

    return `${property} requires the following properties: [${requiredPropsDescription}]`
  }
}

/**
 * If the decorated prop is defined, validate if the required
 * properties are also defined and have the specified values
 */
export function RequiredProps(requiredProps: PropVal[], validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'RequiredProps',
      target: object.constructor,
      propertyName: propertyName,
      constraints: requiredProps,
      options: validationOptions,
      validator: RequireOtherPropConstraint
    })
  }
}
