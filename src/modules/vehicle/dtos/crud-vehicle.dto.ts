import { IsVehiclePlate } from '../validators/is-vehicle-plate.validator'
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'
import { Field, InputType, PartialType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'

@InputType()
export class CreateVehicleDTO {
  @Field()
  @IsString()
  @IsVehiclePlate()
  @Transform(({ value: v }) => (typeof v === 'string' ? v.toLocaleUpperCase() : v))
  plate!: string

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  modelYear?: number | null

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  fabricationYear?: number | null

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  brand?: string | null

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  model?: string | null

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  renavam?: string | null

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  color?: string | null

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  chassisNumber?: string | null
}

@InputType()
export class UpdateVehicleDTO extends PartialType(CreateVehicleDTO) {
  /**
   * If the current vehicle photo should be deleted
   */
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  removePhoto?: boolean
}
