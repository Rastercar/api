import { NotFoundException } from '@nestjs/common'
import mikroOrmCfg from './mikro-orm.config'

it('[MikroORM findOneOrFailHandler] Throws a NotFoundException when a entity is not found', () => {
  if (!mikroOrmCfg.findOneOrFailHandler) fail('findOneOrFailHandler not set')

  expect(() => (mikroOrmCfg.findOneOrFailHandler as any)('SomeEntity', {})).toThrow(NotFoundException)
})
