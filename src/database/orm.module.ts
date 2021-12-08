import { MikroOrmModule } from '@mikro-orm/nestjs'
import ormConfig from './mikro-orm.config'
import { Module } from '@nestjs/common'
import { entities } from './entities'

@Module({
  imports: [MikroOrmModule.forRoot(ormConfig), MikroOrmModule.forFeature({ entities })],
  exports: [MikroOrmModule]
})
export class OrmModule {}
