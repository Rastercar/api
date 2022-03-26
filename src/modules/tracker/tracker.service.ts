import { randomIntFromInterval, randomElementFromArray } from '../../utils/rng.utils'
import { PositionService } from '../positions/position.service'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { TrackerRepository } from './tracker.repository'
import { Inject, Injectable } from '@nestjs/common'
import { PUB_SUB } from '../pubsub/pubsub.module'
import { PositionRecievedEvent, TRACKER_EVENTS } from './tracker.events'

@Injectable()
export class TrackerService {
  constructor(
    @Inject(PUB_SUB)
    readonly pubSub: RedisPubSub,
    readonly positionService: PositionService,
    readonly trackerRepository: TrackerRepository
  ) {}

  /**
   * Pretends to recieve a transmission from a random tracker, storing the position and broadcasting it
   */
  async mockTransmissions(): Promise<void> {
    const trackers = await this.trackerRepository.find({ organization: 6 })

    const tracker = randomElementFromArray(trackers)

    const centerPosition = { lat: -20.4702829, lng: -54.580612 }

    const latOffset = randomIntFromInterval(1, 9) / 300
    const lngOffset = randomIntFromInterval(1, 9) / 300

    const position = {
      lat: centerPosition.lat - latOffset,
      lng: centerPosition.lng - lngOffset
    }

    await this.positionService.registerMockPosition(tracker.id, [position.lat, position.lng])

    await this.pubSub.publish<PositionRecievedEvent>(TRACKER_EVENTS.POSITION_RECIEVED, {
      listenToTracker: { ...tracker, lastPosition: position }
    })
  }
}