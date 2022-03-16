import ormConfig from './postgres/mikro-orm.config'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { mongoConfig } from './mongodb/mongo.config'
import { entities } from './postgres/entities'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    MikroOrmModule.forRoot({ contextName: 'postgres', registerRequestContext: false, entities, ...ormConfig }),
    MikroOrmModule.forRoot({ contextName: 'mongo', registerRequestContext: false, ...mongoConfig })
  ],
  exports: [MikroOrmModule]
})
export class OrmModule {}
