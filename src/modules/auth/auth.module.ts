import { UnregisteredUser } from '../user/entities/unregistered-user.entity'
import { Organization } from '../organization/entities/organization.entity'
import { OrganizationModule } from '../organization/organization.module'
import { MasterUser } from '../user/entities/master-user.entity'
import { GoogleStrategy } from './strategies/google.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { jwtConfig } from '../../config/jwt.config'
import { User } from '../user/entities/user.entity'
import { AuthController } from './auth.controller'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { PassportModule } from '@nestjs/passport'
import { UserModule } from '../user/user.module'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
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
  providers: [AuthService, AuthResolver, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [AuthService, AuthResolver, LocalStrategy, JwtStrategy, GoogleStrategy]
})
export class AuthModule {}
