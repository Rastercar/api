import { PositionService } from './position.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Position } from './position.entity'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Position] }, 'mongo')],
  providers: [PositionService],
  exports: [PositionService]
})
export class PositionModule {}
