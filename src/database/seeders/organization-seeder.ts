import { Organization } from '../../modules/organization/entities/organization.entity'
import { Factory, faker, Faker } from '@mikro-orm/seeder'
import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

export const createFakeOrganization = (fkr = faker): Partial<Organization> => {
  return {
    name: fkr.company.companyName(),
    billingEmail: fkr.internet.email(),
    billingEmailVerified: true
  }
}

export class OrganizationFactory extends Factory<Organization> {
  model = Organization as any

  definition(faker: Faker): Partial<Organization> {
    return createFakeOrganization(faker)
  }
}

export class OrganizationSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const factory = new OrganizationFactory(em)
    await factory.create(5)
  }
}
