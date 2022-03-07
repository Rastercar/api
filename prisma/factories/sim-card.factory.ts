import { Prisma } from '@prisma/client'
import * as faker from 'faker'

import { apnsByBrazillianProvider } from '../../src/constants/sim-card-apn'
import { randomElementFromArray } from '../../src/utils/rng.utils'

export const simCardFactory = (overides?: Partial<Prisma.SimCardCreateManyInput>): Prisma.SimCardCreateManyInput => {
  const apnProviders = Object.values(apnsByBrazillianProvider)
  const { apnAddress, apnPassword, apnUser } = randomElementFromArray(apnProviders)

  return {
    ssn: faker.helpers.replaceSymbolWithNumber('89#########'),
    apnUser,
    apnAddress,
    apnPassword,
    phoneNumber: faker.phone.phoneNumber('+55 (##) #####-#####'),

    organizationId: 1,

    ...overides
  }
}
