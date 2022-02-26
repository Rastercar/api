import { UnregisteredUser } from '../user/entities/unregistered-user.entity'
import { Organization } from '../organization/entities/organization.entity'
import { OrganizationModule } from '../organization/organization.module'
import { AuthMailerService } from './services/auth-mailer.service'
import { MasterUser } from '../user/entities/master-user.entity'
import { AuthTokenService } from './services/auth-token.service'
import { GoogleStrategy } from './strategies/google.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { AuthService } from './services/auth.service'
import { jwtConfig } from '../../config/jwt.config'
import { User } from '../user/entities/user.entity'
import { AuthController } from './auth.controller'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { PassportModule } from '@nestjs/passport'
import { UserModule } from '../user/user.module'
import { AuthResolver } from './auth.resolver'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    UserModule,
    OrganizationModule,
    JwtModule.registerAsync(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MikroOrmModule.forFeature({ entities: [User, UnregisteredUser, Organization, MasterUser] })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthMailerService, AuthTokenService, AuthResolver, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [AuthService, AuthMailerService, AuthTokenService, AuthResolver, LocalStrategy, JwtStrategy, GoogleStrategy]
})
export class AuthModule {}
