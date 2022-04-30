import { Injectable } from '@nestjs/common'
import { OrganizationRepository } from '../organization/repositories/organization.repository'
import { SimCard } from '../sim-card/sim-card.entity'
import { SimCardRepository } from '../sim-card/sim-card.repository'

interface RemoveSimFromTrackerArgs {
  simCardId: number
  userOrganization: number
}

@Injectable()
export class SimCardService {
  constructor(readonly simCardRepository: SimCardRepository, readonly organizationRepository: OrganizationRepository) {}

  async removeSimCardFromItsTracker(options: RemoveSimFromTrackerArgs): Promise<SimCard> {
    const { simCardId, userOrganization } = options

    const sim = await this.simCardRepository.findOneOrFail({ id: simCardId, organization: userOrganization })
    sim.tracker = null

    await this.simCardRepository.persistAndFlush(sim)

    return sim
  }
}
