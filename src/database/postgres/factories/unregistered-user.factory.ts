import { UnregisteredUser } from '../../../modules/user/entities/unregistered-user.entity'
import { Factory, faker } from '@mikro-orm/seeder'

export function createFakeUnregisteredUser(): Partial<UnregisteredUser>
export function createFakeUnregisteredUser(instantiate: true): UnregisteredUser
export function createFakeUnregisteredUser(instantiate?: true): UnregisteredUser | Partial<UnregisteredUser> {
  const userData = {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    emailVerified: Math.random() < 0.5,
    oauthProfileId: faker.random.word(),
    oauthProvider: 'google' as const
  }

  return instantiate ? new UnregisteredUser(userData) : userData
}

export class UnregisteredUserFactory extends Factory<UnregisteredUser> {
  model = UnregisteredUser as any

  definition() {
    return createFakeUnregisteredUser()
  }
}
