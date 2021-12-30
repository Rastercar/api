import { jwtConfig } from '../../config/jwt.config'
import { forwardRef, Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { AuthModule } from '../auth/auth.module'
import { UserService } from './user.service'
import { User } from './entities/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { UserResolver } from './resolvers/user.resolver'
import { UnregisteredUser } from './entities/unregistered-user.entity'
import { UnregisteredUserResolver } from './resolvers/unregistered-user.resolver'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    JwtModule.registerAsync(jwtConfig),
    MikroOrmModule.forFeature({ entities: [User, UnregisteredUser] })
  ],
  providers: [UserService, UserResolver, UnregisteredUserResolver],
  exports: [UserService, UserResolver, UnregisteredUserResolver]
})
export class UserModule {}
