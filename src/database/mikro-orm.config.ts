/**
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

import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import { Logger, NotFoundException } from '@nestjs/common'
import getDatabaseConfig from '../config/database.config'
import { LoadStrategy, Options } from '@mikro-orm/core'
import { entities } from './entities'

const logger = new Logger('MikroORM')

const findOneOrFailHandler = (entityName: string) => {
  throw new NotFoundException(`${entityName} not found.`)
}

export default {
  ...getDatabaseConfig(),

  entities,

  logger: logger.log.bind(logger),

  migrations: {
    path: './src/database/migrations'
  },

  seeder: {
    path: './src/database/seeders',
    defaultSeeder: 'UserSeeder'
  },

  allowGlobalContext: false,

  loadStrategy: LoadStrategy.JOINED,

  highlighter: process.env.NODE_ENV === 'development' ? new SqlHighlighter() : null,

  findOneOrFailHandler
} as Options
