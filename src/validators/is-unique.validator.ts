import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator'
import { ValidationOptions, registerDecorator } from 'class-validator'
import { InjectEntityManager } from '@mikro-orm/nestjs'
import { EntityManager } from '@mikro-orm/postgresql'
import { EntityClass } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'

interface IsUniqueOptions<T> {
  entity: EntityClass<T>
  column: keyof T
}

@Injectable()
@ValidatorConstraint({ async: true })
export class isUniqueValidator<T> implements ValidatorConstraintInterface {
  constructor(
    @InjectEntityManager('postgres')
    readonly em: EntityManager
  ) {}

  async validate(value: unknown, args: ValidationArguments) {
    const options: IsUniqueOptions<T> = args.constraints[0]
    const record = await this.em.findOne(options.entity, { [options.column]: value })

    return !record
  }

  defaultMessage(args: ValidationArguments) {
    const options: IsUniqueOptions<T> = args.constraints[0]
    // DO NOT MODIFY THIS MESSAGE WITHOUT NOTICING FRONTEND FIRST
    return `[NOT_UNIQUE__${options.column}] Invalid property: ${args.property}, value ${args.value} for key ${options.column} is not unique`
  }
}

/**
 * Checks if the decorated value is unique for a given column of a entity
 */
export function IsUnique<T>(options: IsUniqueOptions<T>, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: isUniqueValidator
    })
  }
}
