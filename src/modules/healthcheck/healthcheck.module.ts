import { HealthcheckController } from './healthcheck.controller'
import { Module } from '@nestjs/common'

@Module({
  controllers: [HealthcheckController]
})
export class HealthcheckModule {}
