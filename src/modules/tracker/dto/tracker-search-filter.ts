import { IsBoolean, IsOptional } from 'class-validator'
import { ArgsType, Field } from '@nestjs/graphql'

@ArgsType()
export class TrackerSearchFilterArgs {
  @Field(() => Boolean, { description: 'If the tracker is not associated/installed on a vehicle', nullable: true })
  @IsBoolean()
  @IsOptional()
  installedOnVehicle: boolean | null = null
}
