import { IsBoolean, IsOptional } from 'class-validator'
import { ArgsType, Field } from '@nestjs/graphql'

@ArgsType()
export class SimCardSearchFilterArgs {
  @Field(() => Boolean, { description: 'If the sim card is not associated/installed on a tracker', nullable: true })
  @IsBoolean()
  @IsOptional()
  installedOnTracker: boolean | null = null
}
