import { UnregisteredUserFactory } from '../factories/unregistered-user.factory'
import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

export class UnregisteredUserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const factory = new UnregisteredUserFactory(em)
    factory.create(5)
  }
}
