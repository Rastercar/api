import { Controller, Get, UnauthorizedException } from '@nestjs/common'

@Controller()
export class HealthcheckController {
  @Get('healthcheck')
  getHealthcheck() {
    return 'ok'
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

      'MONGO_HOST',

      'JWT_DEFAULT_TTL',

      'REDIS_HOST',
      'REDIS_PORT',

      'AWS_REGION',

      'API_BASE_URL',
      'PWA_BASE_URL',

      'NO_REPLY_EMAIL'
    ]

    return allowedEnvVars.reduce((prev, envVar) => ({ ...prev, [envVar]: process.env[envVar] }), {})
  }
}
