import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { randomElementFromArray, randomIntFromInterval } from '../../utils/rng.utils'
import { OrganizationRepository } from '../organization/repositories/organization.repository'
import { PositionService } from '../positions/position.service'
import { PUB_SUB } from '../pubsub/pubsub.module'
import { CreateSimCardDTO } from '../sim-card/dto/crud-sim-card.dto'
import { SimCard } from '../sim-card/sim-card.entity'
import { SimCardRepository } from '../sim-card/sim-card.repository'
import { HOMOLOGATED_TRACKER } from './tracker.constants'
import { Tracker } from './tracker.entity'
import { PositionRecievedEvent, TRACKER_EVENTS } from './tracker.events'
import { TrackerRepository } from './tracker.repository'

interface RemoveTrackerFromVehicleArgs {
  trackerId: number
  removeSimCards: boolean
  userOrganization: number
}

interface SetTrackerSimCardArgs {
  trackerId: number
  simCardIds: number[]
  userOrganization: number
}

interface InstallNewSimCardArgs {
  dto: CreateSimCardDTO
  trackerId: number
  userOrganization: number
}

@Injectable()
export class TrackerService {
  constructor(
    @Inject(PUB_SUB)
    readonly pubSub: RedisPubSub,
    readonly positionService: PositionService,
    readonly trackerRepository: TrackerRepository,
    readonly simCardRepository: SimCardRepository,
    readonly organizationRepository: OrganizationRepository
  ) {}

  /**
   * @throws {UnauthorizedException} If a tracker does not belong to the organization
   */
  async assertTrackersBelongToOrganization(options: { organization: number; trackerIds: number[] }): Promise<void> {
    const trackerIdsAndOrgIds: { id: number; organization_id: number }[] = await this.trackerRepository
      .getKnex()
      .select(['id', 'organization_id'])
      .from('tracker')
      .whereIn('id', options.trackerIds)

    const trackersThatDontBelongToOrg = trackerIdsAndOrgIds
      .filter(({ organization_id }) => organization_id !== options.organization)
      .map(({ id }) => id)

    if (trackersThatDontBelongToOrg.length > 0) {
      throw new UnauthorizedException(`Trackers ${trackersThatDontBelongToOrg.join(', ')} do not belong to the user organization`)
    }
  }

  async removeTrackerFromCurrentVehicle(options: RemoveTrackerFromVehicleArgs): Promise<Tracker> {
    const { removeSimCards, trackerId, userOrganization } = options

    const tracker = await this.trackerRepository.findOneOrFail({ id: trackerId, organization: userOrganization })
    tracker.vehicle = null

    let sims: SimCard[] = []

    if (removeSimCards) {
      sims = await this.simCardRepository.find({ tracker })
      sims.forEach(sim => (sim.tracker = null))
    }

    await this.trackerRepository.persistAndFlush([tracker, ...sims])

    return tracker
  }

  async setSimCards(options: SetTrackerSimCardArgs) {
    const { trackerId, simCardIds, userOrganization } = options

    const tracker = await this.trackerRepository.findOneOrFail(
      { id: trackerId, organization: userOrganization },
      { populate: ['simCards'] }
    )

    const trackerModelDetails = HOMOLOGATED_TRACKER[tracker.model]

    if (simCardIds.length > trackerModelDetails.simCardSlots) {
      throw new BadRequestException(`Tracker model ${tracker.model} only support up to ${trackerModelDetails.simCardSlots} sim cards`)
    }

    const simCardsToAssociate = await this.simCardRepository.find({
      id: { $in: simCardIds },
      organization: userOrganization,
      tracker: null
    })
    const simsToAssociateIds = simCardsToAssociate.map(s => s.id)

    const unavaliableOrNotFoundSims = simCardIds.filter(simId => !simsToAssociateIds.includes(simId))

    if (unavaliableOrNotFoundSims.length > 0) {
      const idsStr = unavaliableOrNotFoundSims.join(', ')
      throw new BadRequestException(
        `Cannot associate sim cards: ${idsStr} as they were not found or do not belong to the user organization or are already installed in another tracker`
      )
    }

    tracker.simCards.set(simCardsToAssociate)

    await this.trackerRepository.persistAndFlush(tracker)

    return tracker
  }

  async installSimCard(options: InstallNewSimCardArgs): Promise<SimCard> {
    const { userOrganization, dto, trackerId } = options

    const organization = await this.organizationRepository.findOneOrFail({ id: userOrganization })
    const tracker = await this.trackerRepository.findOneOrFail({ id: trackerId, organization }, { populate: ['simCards'] })

    const { simCardSlots } = HOMOLOGATED_TRACKER[tracker.model]

    if (tracker.simCards.length >= simCardSlots) {
      throw new BadRequestException(`Tracker: ${tracker.id} has no free slots to install sim cards`)
    }

    await Promise.all([
      this.simCardRepository.assertUniquenessForColumn('ssn', dto.ssn),
      this.simCardRepository.assertUniquenessForColumn('phoneNumber', dto.phoneNumber)
    ])

    const sim = SimCard.create({ organization, ...dto })
    sim.tracker = tracker

    await this.simCardRepository.persistAndFlush(sim)

    return sim
  }

  /**
   * TODO: REMOVE ME
   *
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
