import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core'

/**
 * Drops and recreates the entire schema, use with caution
 *
 * @param orm - The mikro-orm instance, make sure this is configured with the test database
 */
export const clearDatabase = async (orm: MikroORM<IDatabaseDriver<Connection>>): Promise<void> => {
  if (process.env.NODE_ENV !== 'test') throw new Error('Cannot clear database on non test enviroments')

  await orm.getSchemaGenerator().dropSchema({ dropDb: true, dropMigrationsTable: true })

  const migrator = orm.getMigrator()

  const pendingMigrations = await migrator.getPendingMigrations()

  if (pendingMigrations && pendingMigrations.length > 0) {
    await migrator.up()
  }
}
