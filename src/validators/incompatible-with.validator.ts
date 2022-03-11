import {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint,
  registerDecorator,
  ValidationOptions,
  isDefined,
  ValidateIf
} from 'class-validator'

@ValidatorConstraint({ async: false })
class IncompatibleWithConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    console.log({ value, args })

    if (isDefined(value)) return this.getFailedConstraints(args).length === 0
    return true
  }

  defaultMessage(args: ValidationArguments) {
    const propsArr = this.getFailedConstraints(args).join(', ')
    return `${args.property} cannot exist alongside the following defined properties: ${propsArr}`
  }

  getFailedConstraints(args: ValidationArguments) {
    console.log(args.constraints)
    return args.constraints.filter(prop => isDefined(args.object[prop]))
  }
}

function IncompatibleWith(props: string[], validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: props,
      validator: IncompatibleWithConstraint
    })
  }
}

function incompatibleSiblingsNotPresent(incompatibleSiblings: string[]) {
  return function (object: any, value: any) {
    return isDefined(value) || incompatibleSiblings.every(prop => !isDefined(object[prop]))
  }
}

/**
 * Verifies if the current object has a defined property that cannot coexist with this one
 * if so, fails and skips any aditional validation
 */
export function IncompatableWith(incompatibleSiblings: string[]) {
  const notSibling = IncompatibleWith(incompatibleSiblings)
  const validateIf = ValidateIf(incompatibleSiblingsNotPresent(incompatibleSiblings))

  return function (target: any, key: string) {
    notSibling(target, key)
    validateIf(target, key)
  }
}
