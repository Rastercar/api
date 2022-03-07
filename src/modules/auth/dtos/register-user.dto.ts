import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

@InputType()
export class RegisterUserDTO {
  @Field()
  @MinLength(5)
  @MaxLength(60)
  username!: string

  @Field()
  @IsEmail()
  email!: string

  @Field()
  @MinLength(5)
  @MaxLength(200)
  @Matches(/[0-9]/, { message: 'password must contain a number' })
  @Matches(/[A-Z]/, { message: 'Password must contain a uppercase letter' })
  @Matches(/[a-z]/, { message: 'password must contain a lowercase letter' })
  @Matches(/[#?!@$%^&*-]/, { message: 'password must contain a symbol in: #?!@$%^&*-' })
  password!: string

  @Field(() => String, {
    nullable: true,
    description:
      'UUID of the unregistered user this registration refers to, once finished the referred unregistered user will be deleted, this is also used to determine wheter the user being registered uses oauth for authentication'
  })
  @IsString()
  @IsOptional()
  refersToUnregisteredUser!: string | null
}
