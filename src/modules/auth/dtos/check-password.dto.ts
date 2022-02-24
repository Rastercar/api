import { IsString, Length } from 'class-validator'

export class CheckPasswordDTO {
  @IsString()
  @Length(5, 50)
  password!: string
}
