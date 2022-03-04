import { OrganizationFactory } from '../factories/organization.factory'
import { UserFactory } from '../factories/user.factory'
import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { VehicleFactory } from '../factories/vehicle.factory'

export class OrganizationSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const factory = new OrganizationFactory(em).each(org => {
      org.users.set(new UserFactory(em).make(5, { organization: org }))
      org.vehicles.set(new VehicleFactory(em).make(5, { organization: org }))
    })

    const orgs = await factory.create(5)

    // Since orgs cannot have owners when they are being created, since the user would
    // also need a org (the one we are creating) the solution is to update every org to
    // have its first user as the owner
    orgs.map(async org => {
      org.owner = org.users[0]
    })

    await em.flush()
  }
}
