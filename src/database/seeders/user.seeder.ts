import { Organization } from '../../modules/organization/entities/organization.entity'
import { AccessLevel } from '../../modules/auth/entities/access-level.entity'
import { User } from '../../modules/user/entities/user.entity'
import { Factory, faker, Faker } from '@mikro-orm/seeder'
import type { EntityManager } from '@mikro-orm/core'
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

export const createFakeUser = (fkr = faker): Partial<User> => {
  const orgname = fkr.company.companyName()

  const org = new Organization({
    name: orgname,
    billingEmail: fkr.internet.email(),
    billingEmailVerified: true
  })

  return {
    username: fkr.internet.userName(),
    password: bcrypt.hashSync(fkr.internet.password(), 1),

    email: fkr.internet.email(),
    emailVerified: Math.random() < 0.5,

    googleProfileId: null,

    organization: org,

    accessLevel: new AccessLevel({
      isFixed: true,
      name: `${orgname} access level`,
      description: fkr.lorem.words(7),
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
