import { OffsetPaginated } from '../../graphql/pagination/offset-pagination'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Vehicle } from './vehicle.entity'

@ObjectType({ description: 'vehicle' })
export class VehicleModel {
  @Field(() => Int)
  id!: number

  @Field()
  plate!: string

  @Field(() => String, { nullable: true })
  photo!: string | null

  @Field(() => Number, { nullable: true })
  modelYear!: number | null

  @Field(() => Number, { nullable: true })
  fabricationYear!: number | null

  @Field(() => String, { nullable: true })
  chassisNumber!: string | null

  @Field(() => String, { nullable: true })
  brand!: string | null

  @Field(() => String, { nullable: true })
  model!: string | null

  @Field(() => String, { nullable: true })
  renavam!: string | null

  @Field(() => String, { nullable: true })
  color!: string | null
}

@ObjectType()
export class OffsetPaginatedVehicle extends OffsetPaginated(VehicleModel) {}

export const VEHICLE_ORDERABLE_FIELDS: (keyof Vehicle)[] = [
  'id',
  'plate',
  'model',
  'brand',
  'color',
  'renavam',
  'modelYear',
  'chassisNumber',
  'fabricationYear'
]
