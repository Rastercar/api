import { Prisma } from '@prisma/client'

import { randomElementFromArray } from '../../src/utils/rng.utils'

const models = ['maxtrack', 'suntech', 'gtk']

export const trackerFactory = (overides?: Partial<Prisma.TrackerCreateManyInput>): Prisma.TrackerCreateManyInput => ({
  model: randomElementFromArray(models),

  organizationId: 1,

  ...overides
})
