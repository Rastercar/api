import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { TrackerModel } from '../tracker/tracker.model'
import TrackerLoader from '../tracker/tracker.loader'
import { of } from '../../utils/coverage-helpers'
import { SimCardModel } from './sim-card.model'
import { SimCard } from './sim-card.entity'

@Resolver(of(SimCardModel))
export class SimCardResolver {
  constructor(readonly trackerLoader: TrackerLoader) {}

  @ResolveField('tracker', () => TrackerModel, { nullable: true })
  async tracker(@Parent() simCard: SimCard) {
    if (!simCard.tracker?.id) return null
    return this.trackerLoader.loader.load(simCard.tracker.id)
  }
}
