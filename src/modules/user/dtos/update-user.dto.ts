import { Field, InputType } from '@nestjs/graphql'
import { IsBoolean, IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator'

@InputType()
export class UpdateUserDTO {
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(5)
  @MaxLength(60)
  username?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(5)
  @MaxLength(200)
  password?: string

  /**
   * If the user being updated google profile should no longer be associated with him.
   *
   * important: this will disable his option to login using google
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  removeGoogleProfileLink?: true
}
