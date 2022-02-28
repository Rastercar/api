import { IsString, MaxLength, MinLength } from 'class-validator'

export class ChangePasswordDTO {
  @MinLength(5)
  @MaxLength(60)
  password!: string

  @IsString()
  passwordResetToken!: string
}
