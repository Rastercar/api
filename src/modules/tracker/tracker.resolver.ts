import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { SimCardModel } from '../sim-card/sim-card.model'
import { VehicleModel } from '../vehicle/vehicle.model'
import SimCardLoader from '../sim-card/sim-card.loader'
import VehicleLoader from '../vehicle/vehicle.loader'
import { of } from '../../utils/coverage-helpers'
import { TrackerModel } from './tracker.model'
import { Tracker } from './tracker.entity'
import { SimpleOrganizationModel } from '../organization/models/organization.model'
import { wrap } from '@mikro-orm/core'
import OrganizationLoader from '../organization/organization.loader'

@Resolver(of(TrackerModel))
export class TrackerResolver {
  constructor(
    readonly vehicleLoader: VehicleLoader,
    readonly simCardLoader: SimCardLoader,
    readonly organizationLoader: OrganizationLoader
  ) {}

  @ResolveField(() => SimpleOrganizationModel)
  async organization(@Parent() tracker: Tracker): Promise<SimpleOrganizationModel> {
    return wrap(tracker.organization).isInitialized() ? tracker.organization : this.organizationLoader.byId.load(tracker.organization.id)
  }

  @ResolveField(() => VehicleModel)
  vehicle(@Parent() tracker: Tracker): Promise<VehicleModel | null> {
    return this.vehicleLoader.byTrackerId.load(tracker.id)
  }

  @ResolveField(() => [SimCardModel])
  simCards(@Parent() tracker: Tracker): Promise<SimCardModel[]> {
    return this.simCardLoader.byTrackerId.load(tracker.id)
  }
}
