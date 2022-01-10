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

import { Logger, NotFoundException } from '@nestjs/common'
import getDatabaseConfig from '../config/database.config'
import { EntityManager, Options } from '@mikro-orm/core'
import { entities } from './entities'
import { AsyncLocalStorage } from 'async_hooks'

const logger = new Logger('MikroORM')

const storage = new AsyncLocalStorage<EntityManager>()

const findOneOrFailHandler = (entityName: string) => {
  throw new NotFoundException(`${entityName} not found.`)
}

export default {
  ...getDatabaseConfig(),

  entities,

  logger: logger.log.bind(logger),
  context: () => storage.getStore(),

  findOneOrFailHandler
} as Options
