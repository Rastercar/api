import { MasterUser } from '../../modules/user/entities/master-user.entity'
import { Factory, Faker } from '@mikro-orm/seeder'
import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { UnregisteredUser } from '../../modules/user/entities/unregistered-user.entity'

export class UnregisteredUserFactory extends Factory<UnregisteredUser> {
  model = MasterUser as any

  definition(faker: Faker): Partial<UnregisteredUser> {
    const oauthProfileId = Math.random() < 0.5 ? faker.random.word() : undefined

    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      emailVerified: Math.random() < 0.5,
      oauthProfileId,
      oauthProvider: oauthProfileId ? undefined : 'google'
    }
  }
}

export class UnregisteredUserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const factory = new UnregisteredUserFactory(em)
    factory.create(5)
  }
}
