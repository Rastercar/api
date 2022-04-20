import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { randomElementFromArray, randomIntFromInterval } from '../../utils/rng.utils'
import { PositionService } from '../positions/position.service'
import { PUB_SUB } from '../pubsub/pubsub.module'
import { PositionRecievedEvent, TRACKER_EVENTS } from './tracker.events'
import { TrackerRepository } from './tracker.repository'

@Injectable()
export class TrackerService {
  constructor(
    @Inject(PUB_SUB)
    readonly pubSub: RedisPubSub,
    readonly positionService: PositionService,
    readonly trackerRepository: TrackerRepository
  ) {}

  /**
   * @throws {UnauthorizedException} If a tracker does not belong to the organization
   */
  async assertTrackersBelongToOrganization(args: { organization: number; trackerIds: number[] }): Promise<void> {
    const trackerIdsAndOrgIds: { id: number; organization_id: number }[] = await this.trackerRepository
      .getKnex()
      .select(['id', 'organization_id'])
      .from('tracker')
      .whereIn('id', args.trackerIds)

    const trackersThatDontBelongToOrg = trackerIdsAndOrgIds
      .filter(({ organization_id }) => organization_id !== args.organization)
      .map(({ id }) => id)

    if (trackersThatDontBelongToOrg.length > 0) {
      throw new UnauthorizedException(`Trackers ${trackersThatDontBelongToOrg.join(', ')} do not belong to the user organization`)
    }
  }

  /**
   * Pretends to recieve a transmission from a random tracker, storing the position and broadcasting it
   */
  async mockTransmissions(): Promise<void> {
    const trackers = await this.trackerRepository.findAll()

    const tracker = randomElementFromArray(trackers)

    const centerPosition = { lat: -20.4702829, lng: -54.580612 }

    const latOffset = randomIntFromInterval(1, 20) / 300
    const lngOffset = randomIntFromInterval(1, 20) / 300

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
