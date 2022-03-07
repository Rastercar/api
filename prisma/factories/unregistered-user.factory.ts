import { Prisma } from '@prisma/client'
import * as faker from 'faker'

export const unregisteredUserFactory = (
  overides?: Partial<Prisma.UnregisteredUserCreateManyInput>
): Prisma.UnregisteredUserCreateManyInput => ({
  username: faker.internet.userName(),
  email: faker.internet.email(),
  emailVerified: Math.random() < 0.5,
  oauthProfileId: faker.random.word(),
  oauthProvider: 'google' as const,
  ...overides
})
