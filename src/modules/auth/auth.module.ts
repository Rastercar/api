import { OrganizationModule } from '../organization/organization.module'
import { AuthMailerService } from './services/auth-mailer.service'
import { AuthTokenService } from './services/auth-token.service'
import { GoogleStrategy } from './strategies/google.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { AuthService } from './services/auth.service'
import { jwtConfig } from '../../config/jwt.config'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { UserModule } from '../user/user.module'
import { AuthResolver } from './auth.resolver'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [UserModule, OrganizationModule, JwtModule.registerAsync(jwtConfig), PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [AuthService, AuthMailerService, AuthTokenService, AuthResolver, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [AuthService, AuthMailerService, AuthTokenService, AuthResolver, LocalStrategy, JwtStrategy, GoogleStrategy]
})
export class AuthModule {}
