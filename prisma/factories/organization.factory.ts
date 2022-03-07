import { Prisma } from '@prisma/client'
import * as faker from 'faker'

export const organizationFactory = (overides?: Partial<Prisma.OrganizationCreateManyInput>): Prisma.OrganizationCreateManyInput => ({
  blocked: false,
  name: faker.company.companyName(),
  billingEmail: faker.internet.email(),
  billingEmailVerified: true,
  ...overides
})
