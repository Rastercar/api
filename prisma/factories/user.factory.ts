import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as faker from 'faker'

export const userFactory = (overides?: Partial<Prisma.UserCreateManyInput>): Prisma.UserCreateManyInput => ({
  username: faker.internet.userName(),
  password: bcrypt.hashSync(faker.internet.password(), 1),

  email: faker.internet.email(),
  emailVerified: Math.random() < 0.5,

  googleProfileId: null,

  organizationId: 1,
  accessLevelId: 1,

  ...overides
})
