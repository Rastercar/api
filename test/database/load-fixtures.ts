import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core'
import { loadUserFixtures } from './fixtures/user.fixtures'

/**
 * Loads fixtures into the database for testing purposes
 *
 * @param orm - The mikro-orm instance, make sure this is configured with the test database
 */
export const loadFixtures = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
  await loadUserFixtures(orm)
}
