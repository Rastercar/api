import { IsNumber, IsOptional, IsString } from 'class-validator'
import { Field, InputType } from '@nestjs/graphql'
import { IsVehiclePlate } from '../validators/is-vehicle-plate.validator'
import { IsUnique } from '../../../validators/is-unique.validator'
import { Vehicle } from '../vehicle.entity'
import { Transform } from 'class-transformer'

@InputType()
export class CreateVehicleDTO {
  @Field()
  @IsString()
  @IsVehiclePlate()
  @IsUnique({ entity: Vehicle, column: 'plate' })
  @Transform(({ value: v }) => (typeof v === 'string' ? v.toLocaleUpperCase() : v))
  plate!: string

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  modelYear?: number

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  fabricationYear?: number

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  brand?: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  model?: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  renavam?: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  color?: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  chassisNumber?: string
}
