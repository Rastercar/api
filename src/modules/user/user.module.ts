import { jwtConfig } from '../../config/jwt.config'
import { forwardRef, Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { AuthModule } from '../auth/auth.module'
import { UserService } from './user.service'
import { User } from './user.entity'
import { JwtModule } from '@nestjs/jwt'
import { UserResolver } from './user.resolver'

@Module({
  imports: [forwardRef(() => AuthModule), JwtModule.registerAsync(jwtConfig), MikroOrmModule.forFeature({ entities: [User] })],
  providers: [UserService, UserResolver],
  exports: [UserService, UserResolver]
})
export class UserModule {}
