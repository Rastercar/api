import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core'
import { User } from '../../../src/modules/user/entities/user.entity'
import * as bcrypt from 'bcrypt'
import * as faker from 'faker'

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

  try {
    const users = [...Array(5)].map(createUser)
    await orm.em.flush()
    return users
  } catch (error) {
    console.error('📌 Could not load fixtures', error)
  }
}
