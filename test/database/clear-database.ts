import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core'

/**
 * Drops and recreates the entire schema, use with caution
 *
 * @param orm - The mikro-orm instance, make sure this is configured with the test database
 */
export const clearDatabase = async (orm: MikroORM<IDatabaseDriver<Connection>>): Promise<void> => {
  await orm.getSchemaGenerator().dropSchema(true, true)

  const migrator = orm.getMigrator()
  const pendingMigrations = await migrator.getPendingMigrations()

  if (pendingMigrations && pendingMigrations.length > 0) {
    await migrator.up()
  }

  // TODO: check me
  // await orm.getSchemaGenerator().updateSchema()
}
