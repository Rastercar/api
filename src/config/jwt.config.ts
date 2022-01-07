import { ConfigModule, ConfigService } from '@nestjs/config'

export const jwtConfig = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    expiresIn: configService.get<string>('JWT_DEFAULT_TTL'),
    signOptions: { expiresIn: configService.get<string>('JWT_DEFAULT_TTL') }
  }),
  inject: [ConfigService]
}
