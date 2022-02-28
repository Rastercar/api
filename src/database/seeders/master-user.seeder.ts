import { MasterAccessLevel } from '../../modules/auth/entities/master-access-level.entity'
import { AccessLevel } from '../../modules/auth/entities/access-level.entity'
import { MasterUser } from '../../modules/user/entities/master-user.entity'
import type { EntityManager } from '@mikro-orm/core'
import { Factory, Faker } from '@mikro-orm/seeder'
import { Seeder } from '@mikro-orm/seeder'
import * as bcrypt from 'bcrypt'

/**
 * A static master user for testing, this user is
 * created everytime the master user seeders are run.
 */
export const defaultMasterUser = new MasterUser({
  username: 'masteruser',
  password: bcrypt.hashSync('masteruser', 10),

  email: 'master.user@gmail.com',
  emailVerified: true,

  accessLevel: new AccessLevel({
    name: 'testUserAccessLevel',
    description: 'wew lad !',
    permissions: []
  }),

  masterAccessLevel: new MasterAccessLevel({
    name: 'default master access level',
    description: '',
    permissions: []
  })
})

export const createFakeMasterUser = (faker: Faker): Partial<MasterUser> => ({
  username: faker.internet.userName(),
  password: bcrypt.hashSync(faker.internet.password(), 1),

  email: faker.internet.email(),
  emailVerified: Math.random() < 0.5,

  resetPasswordToken: null,

  accessLevel: new AccessLevel({
    name: `access level ${faker.lorem.words(1)}`,
    description: faker.lorem.words(7),
    permissions: []
  }),

  masterAccessLevel: new MasterAccessLevel({
    name: `master access level ${faker.lorem.words(1)}`,
    description: faker.lorem.words(7),
    permissions: []
  })
})

export class MasterUserFactory extends Factory<MasterUser> {
  model = MasterUser as any

  definition(faker: Faker): Partial<MasterUser> {
    return createFakeMasterUser(faker)
  }
}

export class MasterUserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const factory = new MasterUserFactory(em)
    factory.create(5)
    factory.createOne(defaultMasterUser)
  }
}
