import { IsEmail, IsString, Length, MinLength } from 'class-validator'
import { Field, InputType } from '@nestjs/graphql'

export class LoginDTO {
  @IsEmail()
  email!: string

  @IsString()
  @Length(5, 50)
  password!: string
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string

  @Field()
  @MinLength(5)
  password!: string
}
