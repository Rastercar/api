import { isUniqueValidator } from './is-unique.validator'
import { Module } from '@nestjs/common'

/**
 * Simple module, used to provide all validators that requires nest DI internally
 */
@Module({ providers: [isUniqueValidator] })
export class ValidatorModule {}
