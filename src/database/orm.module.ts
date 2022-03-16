import { MikroOrmModule } from '@mikro-orm/nestjs'
import { entities } from './postgres/entities'
import ormConfig from './postgres/mikro-orm.config'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    MikroOrmModule.forRoot(ormConfig),

    MikroOrmModule.forRoot({
      contextName: 'postgres',
      registerRequestContext: false,
      ...ormConfig
    }),

    // MikroOrmModule.forRoot({
    //   contextName: 'mongo',
    //   registerRequestContext: false // disable automatatic middleware
    // }),

    MikroOrmModule.forFeature({ entities })
  ],
  exports: [MikroOrmModule]
})
export class OrmModule {}
