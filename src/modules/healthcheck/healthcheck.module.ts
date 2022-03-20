import { HealthcheckController } from './healthcheck.controller'
import { PositionModule } from '../positions/position.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    // TODO: REMOVE ME LATTER
    PositionModule
  ],

  controllers: [HealthcheckController]
})
export class HealthcheckModule {}
