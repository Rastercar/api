import { Controller, Get, UnauthorizedException } from '@nestjs/common'

@Controller()
export class HealthcheckController {
  constructor() {}

  @Get('healthcheck')
  getHealthcheck() {
    return 'ok'
  }

  // TODO: Remove me
  @Get('dev')
  test() {
    return '16:55'
  }

  /**
   * For dev/debugging purposes, just return the non secret env vars
   */
  @Get('enviroment')
  showAllowedEnvVars() {
    if (process.env.NODE_ENV === 'production') throw new UnauthorizedException('Cannot check env in production')

    const allowedEnvVars = [
      'NODE_ENV',
      'API_PORT',

      'DB_HOST',
      'DB_PORT',
      'DB_DEBUG_MODE',

      'JWT_DEFAULT_TTL',

      'API_BASE_URL',
      'PWA_BASE_URL'
    ]

    return allowedEnvVars.reduce((prev, envVar) => ({ ...prev, [envVar]: process.env[envVar] }), {})
  }
}
