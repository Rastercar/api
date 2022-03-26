import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class LatLng {
  @Field(() => Number)
  lat!: number

  @Field(() => Number)
  lng!: number
}
