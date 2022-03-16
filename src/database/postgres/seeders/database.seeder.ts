import { UnregisteredUserSeeder } from './unregistered-user.seeder'
import { OrganizationSeeder } from './organization.seeder'
import { MasterUserSeeder } from './master-user.seeder'
import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { UserSeeder } from './user.seeder'

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // The main seeder here is the organization seeder, other seeders are complementary
    // UserSeeder merely creates a default test user used for e2e tests
    return this.call(em, [UserSeeder, UnregisteredUserSeeder, MasterUserSeeder, OrganizationSeeder])
  }
}
