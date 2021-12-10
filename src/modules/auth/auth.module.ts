import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { jwtConfig } from '../../config/jwt.config'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { UserModule } from '../user/user.module'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'
import { Module } from '@nestjs/common'

@Module({
  imports: [JwtModule.registerAsync(jwtConfig), PassportModule.register({ defaultStrategy: 'jwt' }), UserModule],

  providers: [AuthService, LocalStrategy, JwtStrategy],

  controllers: [AuthController],

  exports: [AuthService, UserModule]
})
export class AuthModule {}
