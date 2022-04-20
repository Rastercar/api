import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'
import { IsE164PhoneNumber } from '../../../validators/is-e164-phone-number.validator'

@InputType()
export class CreateSimCardDTO {
  @Field()
  @IsString()
  @IsE164PhoneNumber()
  phoneNumber!: string

  @Field()
  @IsString()
  @IsNotEmpty()
  ssn!: string

  @Field()
  @IsString()
  apnAddress!: string

  @Field()
  @IsString()
  apnUser!: string

  @Field()
  @IsString()
  apnPassword!: string
}
