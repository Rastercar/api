import { Organization } from '../../modules/organization/entities/organization.entity'
import { Factory, faker } from '@mikro-orm/seeder'

export function createFakeOrganization(): Partial<Organization>
export function createFakeOrganization(instantiate: true): Organization
export function createFakeOrganization(instantiate?: true): Organization | Partial<Organization> {
  const data = {
    name: faker.company.companyName(),
    billingEmail: faker.internet.email(),
    billingEmailVerified: true
  }

  return instantiate ? new Organization(data) : data
}

export class OrganizationFactory extends Factory<Organization> {
  model = Organization as any

  definition(): Partial<Organization> {
    return createFakeOrganization()
  }
}
