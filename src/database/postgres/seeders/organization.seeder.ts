import { OrganizationFactory } from '../factories/organization.factory'
import { Tracker } from '../../../modules/tracker/tracker.entity'
import { SimCardFactory } from '../factories/sim-card.factory'
import { VehicleFactory } from '../factories/vehicle.factory'
import { TrackerFactory } from '../factories/tracker.factory'
import { UserFactory } from '../factories/user.factory'
import type { EntityManager } from '@mikro-orm/core'
import { randomBool } from '../../../utils/rng.utils'
import { Seeder } from '@mikro-orm/seeder'

export class OrganizationSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const orgFactory = new OrganizationFactory(em).each(organization => {
      //
      organization.users.set(new UserFactory(em).make(10, { organization }))

      const vehicleFactory = new VehicleFactory(em).each(vehicle => {
        if (randomBool()) return

        const trackerFactory = new TrackerFactory(em).each((tracker: Tracker) => {
          if (randomBool(80)) tracker.simCards.set(new SimCardFactory(em).make(1, { tracker, organization }))
        })

        vehicle.trackers.set(trackerFactory.make(1, { vehicle, organization }))
      })

      //
      organization.vehicles.set(vehicleFactory.make(20, { organization }))
    })

    const orgs = await orgFactory.create(10)

    // Since orgs cannot have owners when they are being created, since the user would
    // also need a org (the one we are creating) the solution is to update every org to
    // have its first user as the owner
    orgs.map(async org => {
      org.owner = org.users[0]
    })

    await em.flush()
  }
}
