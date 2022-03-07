import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as faker from 'faker'

export const masterUserFactory = (overides: Partial<Prisma.MasterUserCreateManyInput>): Prisma.MasterUserCreateManyInput => ({
  username: faker.internet.userName(),
  password: bcrypt.hashSync(faker.internet.password(), 1),
  email: faker.internet.email(),
  emailVerified: Math.random() < 0.5,
  resetPasswordToken: null,
  accessLevelId: 1,
  masterAccessLevelId: 1,
  ...overides
})
