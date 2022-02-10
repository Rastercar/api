import { Organization } from '../../../src/modules/organization/entities/organization.entity'
import { AccessLevel } from '../../../src/modules/auth/entities/access-level.entity'
import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core'
import { User } from '../../../src/modules/user/entities/user.entity'
import * as bcrypt from 'bcrypt'
import * as faker from 'faker'

const defaultTestUserOrg = new Organization({
  name: 'testuser org',
  billingEmail: 'testuser@gmail.com',
  billingEmailVerified: true
})

/**
 * A static user for testing, this user is created
 * everytime the user fixtures are loaded.
 */
export const defaultTestUser = new User({
  username: 'testuser',
  password: bcrypt.hashSync('testuser', 1),

  email: 'testuser@gmail.com',
  emailVerified: true,

  oauthProvider: null,
  oauthProfileId: null,

  organization: defaultTestUserOrg,

  accessLevel: new AccessLevel({
    isFixed: true,
    name: 'testUserAccessLevel',
    description: 'wew lad !',
    organization: defaultTestUserOrg
  })
})

export const loadUserFixtures = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
  const createUser = () => {
    const username = faker.internet.userName()
    const email = faker.internet.email()

    const organization = new Organization({
      name: username,
      billingEmail: email,
      billingEmailVerified: true
    })

    const user = new User({
      username,
      password: bcrypt.hashSync(faker.internet.password(), 1),

      email,
      emailVerified: Math.random() < 0.5,

      oauthProvider: null,
      oauthProfileId: null,

      organization,

      accessLevel: new AccessLevel({
        isFixed: true,
        name: faker.lorem.words(2),
        description: faker.lorem.words(6),
        organization
      })
    })

    orm.em.persist(user)

    return user
  }

  const users = [...Array(5)].map(createUser)

  orm.em.persist(defaultTestUser)
  await orm.em.flush()

  return users
}
