import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core'
import { User } from '../../../src/modules/user/entities/user.entity'
import * as bcrypt from 'bcrypt'
import * as faker from 'faker'

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
  oauthProfileId: null
})

export const loadUserFixtures = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
  const createUser = () => {
    const user = new User({
      username: faker.internet.userName(),
      password: bcrypt.hashSync(faker.internet.password(), 1),

      email: faker.internet.email(),
      emailVerified: Math.random() < 0.5,

      oauthProvider: null,
      oauthProfileId: null
    })

    orm.em.persist(user)

    return user
  }

  const users = [...Array(5)].map(createUser)

  orm.em.persist(defaultTestUser)
  await orm.em.flush()

  return users
}
