import { Organization } from '../../modules/organization/entities/organization.entity'
import { AccessLevel } from '../../modules/auth/entities/access-level.entity'
import { User } from '../../modules/user/entities/user.entity'
import { UserFactory } from '../factories/user.factory'
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

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const factory = new UserFactory(em)
    await factory.createOne(defaultTestUser)
    await factory.create(5)
  }
}
