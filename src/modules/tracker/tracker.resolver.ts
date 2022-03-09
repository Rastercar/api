import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { SimCardModel } from '../sim-card/sim-card.model'
import { VehicleModel } from '../vehicle/vehicle.model'
import SimCardLoader from '../sim-card/sim-card.loader'
import VehicleLoader from '../vehicle/vehicle.loader'
import { of } from '../../utils/coverage-helpers'
import { TrackerModel } from './tracker.model'
import { Tracker } from './tracker.entity'

@Resolver(of(TrackerModel))
export class TrackerResolver {
  constructor(readonly vehicleLoader: VehicleLoader, readonly simCardLoader: SimCardLoader) {}

  @ResolveField(() => VehicleModel)
  vehicle(@Parent() tracker: Tracker): Promise<VehicleModel | null> {
    return this.vehicleLoader.byTrackerId.load(tracker.id)
  }

  @ResolveField(() => [SimCardModel])
  simCards(@Parent() tracker: Tracker): Promise<SimCardModel[]> {
    return this.simCardLoader.byTrackerId.load(tracker.id)
  }
}
