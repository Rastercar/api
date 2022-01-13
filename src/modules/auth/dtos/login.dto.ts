import { IsEmail, IsString, Length, MinLength } from 'class-validator'
import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { UserModel } from '../../user/models/user.model'
import { JwtModel } from '../models/jwt.model'

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

@ObjectType()
export class LoginResponse {
  @Field()
  token!: JwtModel

  @Field()
  user!: UserModel
}
