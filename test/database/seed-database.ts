import { MasterUserSeeder } from '../../src/database/postgres/seeders/master-user.seeder'
import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core'
import { UserSeeder } from '../../src/database/postgres/seeders/user.seeder'

/**
 * Loads fixtures into the database for testing purposes
 *
 * @param orm - The mikro-orm instance, make sure this is configured with the test database
 */
export const seedDatabase = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
  const seeder = orm.getSeeder()
  await seeder.seed(UserSeeder)
  await seeder.seed(MasterUserSeeder)
}
