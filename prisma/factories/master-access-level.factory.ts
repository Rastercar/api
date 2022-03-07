import { Prisma } from '@prisma/client'
import * as faker from 'faker'

import { PERMISSION } from '../../src/modules/auth/constants/permissions'
import { enumToRandomImpartialArray } from '../../src/utils/enum.utils'

export const masterAccessLevelFactory = (
  overides?: Partial<Prisma.MasterAccessLevelCreateManyInput>
): Prisma.MasterAccessLevelCreateManyInput => ({
  name: `access level ${faker.lorem.words(1)}`,
  description: faker.lorem.words(7),
  permissions: enumToRandomImpartialArray(PERMISSION),
  isFixed: false,
  ...overides
})
