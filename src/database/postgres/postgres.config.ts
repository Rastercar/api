/*
 |
 | This configuration file is used by the mikro-orm cli aswell  
 | as mikro-orm while running the api, the database config vars
 | are defined by the enviroment file at env/.{env_name}.env
 | where env_name is the value of the NODE_ENV enviroment variable
 |
 | So for example if you want to use the mikro-orm CLI for the 
 | test database you can run: NODE_ENV=test yarn mikro-orm...
 |
 */

import getPostgresConfig from '../../config/postgres.config'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import { Logger, NotFoundException } from '@nestjs/common'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { LoadStrategy, Options } from '@mikro-orm/core'
import { entities } from './entities'

const logger = new Logger('MikroORM')

const findOneOrFailHandler = (entityName: string) => {
  throw new NotFoundException(`${entityName} not found.`)
}

const postgresConfig: Options<PostgreSqlDriver> = {
  ...getPostgresConfig(),

  logger: logger.log.bind(logger),

  findOneOrFailHandler,

  entities,

  migrations: {
    path: './src/database/postgres/migrations'
  },

  seeder: {
    path: './src/database/postgres/seeders',
    defaultSeeder: 'DatabaseSeeder'
  },

  allowGlobalContext: false,

  loadStrategy: LoadStrategy.JOINED,

  highlighter: process.env.NODE_ENV === 'development' ? new SqlHighlighter() : undefined
}

export default postgresConfig
