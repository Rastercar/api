import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Paginated } from '../../graphql/pagination/cursor-pagination'
import { OffsetPaginated } from '../../graphql/pagination/offset-pagination'

@ObjectType({ description: 'vehicle' })
export class VehicleModel {
  @Field(type => Int)
  id!: number

  @Field()
  plate!: string

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

// TODO: we will probably not use cursor pagination here, remove ?
@ObjectType()
export class PaginatedVehicle extends Paginated(VehicleModel) {}
@ObjectType()
export class OffsetPaginatedVehicle extends OffsetPaginated(VehicleModel) {}
