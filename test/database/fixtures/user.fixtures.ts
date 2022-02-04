import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core'
import { User } from '../../../src/modules/user/entities/user.entity'
import * as bcrypt from 'bcrypt'
import * as faker from 'faker'
import { Organization } from '../../../src/modules/organization/entities/organization.entity'

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

  organization: new Organization({
    name: 'testuser org',
    billingEmail: 'testuser@gmail.com',
    billingEmailVerified: true
  })
})

export const loadUserFixtures = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
  const createUser = () => {
    const username = faker.internet.userName()
    const email = faker.internet.email()

    const user = new User({
      username,
      password: bcrypt.hashSync(faker.internet.password(), 1),

      email,
      emailVerified: Math.random() < 0.5,

      oauthProvider: null,
      oauthProfileId: null,

      organization: new Organization({
        name: username,
        billingEmail: email,
        billingEmailVerified: true
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
