import { Organization } from '../../modules/organization/entities/organization.entity'
import { AccessLevel } from '../../modules/auth/entities/access-level.entity'
import { User } from '../../modules/user/entities/user.entity'
import type { EntityManager } from '@mikro-orm/core'
import { Factory, Faker } from '@mikro-orm/seeder'
import { Seeder } from '@mikro-orm/seeder'
import * as bcrypt from 'bcrypt'

const defaultTestUserOrg = new Organization({
  name: 'testuser org',
  billingEmail: 'testuser@gmail.com',
  billingEmailVerified: true
})

/**
 * A static user for testing, this user is, created everytime the user seeders are run.
 */
export const defaultTestUser: Partial<User> = {
  username: 'testuser',
  password: bcrypt.hashSync('testuser', 10),

  email: 'testuser@gmail.com',
  emailVerified: true,

  googleProfileId: null,

  organization: defaultTestUserOrg,

  accessLevel: new AccessLevel({
    isFixed: true,
    name: 'testUserAccessLevel',
    description: 'wew lad !',
    organization: defaultTestUserOrg,
    permissions: []
  })
}

export const createFakeUser = (faker: Faker): Partial<User> => {
  const orgname = faker.company.companyName()

  const org = new Organization({
    name: orgname,
    billingEmail: faker.internet.email(),
    billingEmailVerified: true
  })

  return {
    username: faker.internet.userName(),
    password: bcrypt.hashSync(faker.internet.password(), 1),

    email: faker.internet.email(),
    emailVerified: Math.random() < 0.5,

    googleProfileId: null,

    organization: org,

    accessLevel: new AccessLevel({
      isFixed: true,
      name: `${orgname} access level`,
      description: faker.lorem.words(7),
      organization: org,
      permissions: []
    })
  }
}

export class UserFactory extends Factory<User> {
  model = User as any

  definition(faker: Faker): Partial<User> {
    return createFakeUser(faker)
  }
}

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const factory = new UserFactory(em)
    await factory.createOne(defaultTestUser)

    await factory.create(5)
  }
}
