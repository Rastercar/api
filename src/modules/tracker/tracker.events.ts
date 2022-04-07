import { ArgsType, Field, Int } from '@nestjs/graphql'
import { IsInt, IsOptional } from 'class-validator'
import { TrackerModel } from './tracker.model'
import { LatLng } from './dto/lat-lng'

export enum TRACKER_EVENTS {
  /**
   * A new position sent by a tracker has been recieved
   * and registered by the rastercar service
   */
  POSITION_RECIEVED = 'TRACKER_POSITION_RECIEVED'
}

export interface PositionRecievedEvent {
  listenToTracker: TrackerModel & {
    lastPosition: LatLng
  }
}

@ArgsType()
export class TrackerPositionSubscriptionArgs {
  /**
   * The ids of the tracker to listen positions for
   */
  @Field(() => [Int])
  @IsOptional()
  @IsInt({ each: true })
  ids: number[] = []
}
