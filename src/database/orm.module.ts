import postgresConfig from './postgres/postgres.config'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import mongoConfig from './mongo/mongo.config'
import { entities } from './postgres/entities'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    MikroOrmModule.forRoot({ contextName: 'mongo', registerRequestContext: false, ...mongoConfig }),
    MikroOrmModule.forRoot({ contextName: 'postgres', registerRequestContext: false, entities, ...postgresConfig })
  ],
  exports: [MikroOrmModule]
})
export class OrmModule {}
