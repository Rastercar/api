import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'

export const jwtConfig = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      audience: ['https://rastercar.homolog.com:3000', 'https://rastercar.com:3000'],
      expiresIn: configService.get<string>('JWT_DEFAULT_TTL')
    }
  }),
  inject: [ConfigService]
}
