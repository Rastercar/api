import { OrganizationFactory } from '../factories/organization.factory'
import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

export class OrganizationSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const factory = new OrganizationFactory(em)
    await factory.create(5)
  }
}
