import { UnregisteredUser } from '../user/entities/unregistered-user.entity'
import { Organization } from '../organization/entities/organization.entity'
import { OrganizationModule } from '../organization/organization.module'
import { AuthMailerService } from './services/auth-mailer.service'
import { MasterUser } from '../user/entities/master-user.entity'
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
import { JwtEmailStrategy } from './strategies/jwt-email.strategy'

@Module({
  imports: [
    UserModule,
    OrganizationModule,
    JwtModule.registerAsync(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MikroOrmModule.forFeature({ entities: [User, UnregisteredUser, Organization, MasterUser] })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthResolver, LocalStrategy, JwtStrategy, JwtEmailStrategy, GoogleStrategy, AuthMailerService],
  exports: [AuthService, AuthResolver, LocalStrategy, JwtStrategy, JwtEmailStrategy, GoogleStrategy]
})
export class AuthModule {}
