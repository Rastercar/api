import { Field, InputType, Int } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsNotEmpty, IsString, ValidateIf, ValidateNested } from 'class-validator'
import { IncompatableWith } from '../../../validators/incompatible-with.validator'
import { CreateSimCardDTO } from '../../sim-card/dto/crud-sim-card.dto'
import { trackerModel, TRACKER_MODELS } from '../tracker.constants'

// WE CANT HAVE UNIONS AS INPUTS SO FOR NOW (see: https://github.com/graphql/graphql-spec/issues/488)
@InputType({
  description: 'Wrapper input for either a object with a existing SimCard ID or a DTO for creating a new SimCard'
})
export class CreateSimCardDtoOrId {
  @Field(() => Int, {
    nullable: true,
    description: 'The ID of the sim card to be used, DTO must be null if this is prop is not null'
  })
  @ValidateIf(obj => !obj.dto)
  @IncompatableWith(['dto'])
  @IsInt()
  id!: number | null

  @Field(() => CreateSimCardDTO, {
    nullable: true,
    description: 'The data of the sim card to be created, if this is not null ID must be null'
  })
  @ValidateIf(obj => !obj.id)
  @IncompatableWith(['id'])
  @ValidateNested()
  @Type(() => CreateSimCardDTO)
  dto!: CreateSimCardDTO | null
}

@InputType()
export class CreateTrackerDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  identifier!: string

  @Field()
  @IsString()
  @IsIn(TRACKER_MODELS)
  model!: trackerModel

  @Field(() => [CreateSimCardDtoOrId])
  @ValidateNested({ each: true })
  @Type(() => CreateSimCardDtoOrId)
  simCards!: CreateSimCardDtoOrId[]
}
