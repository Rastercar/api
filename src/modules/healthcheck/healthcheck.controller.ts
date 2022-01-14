import { Controller, Get } from '@nestjs/common'

@Controller('healthcheck')
export class HealthcheckController {
  constructor() {}

  @Get()
  getHealthcheck() {
    return 'ok'
  }
}
