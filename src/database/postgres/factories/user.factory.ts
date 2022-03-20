import { createFakeOrganization } from './organization.factory'
import { User } from '../../../modules/user/entities/user.entity'
import { createFakeAccessLevel } from './access-level.factory'
import { Factory, faker } from '@mikro-orm/seeder'
import bcrypt from 'bcrypt'

export function createFakeUser(): Partial<User>
export function createFakeUser(instantiate: true): User
export function createFakeUser(instantiate?: true): User | Partial<User> {
  const org = createFakeOrganization(true)

  const userData = {
    username: faker.internet.userName(),
    password: bcrypt.hashSync(faker.internet.password(), 1),

    email: faker.internet.email(),
    emailVerified: Math.random() < 0.5,

    googleProfileId: null,

    organization: org,

    accessLevel: createFakeAccessLevel(true)
  }

  return instantiate ? new User(userData) : userData
}

export class UserFactory extends Factory<User> {
  model = User as any

  definition() {
    return createFakeUser()
  }
}
