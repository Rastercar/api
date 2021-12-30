import { UnregisteredUserResolver } from './resolvers/unregistered-user.resolver'
import { UnregisteredUser } from './entities/unregistered-user.entity'
import { UserResolver } from './resolvers/user.resolver'
import { forwardRef, Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { AuthModule } from '../auth/auth.module'
import { User } from './entities/user.entity'
import { UserService } from './user.service'

@Module({
  imports: [forwardRef(() => AuthModule), MikroOrmModule.forFeature({ entities: [User, UnregisteredUser] })],
  providers: [UserService, UserResolver, UnregisteredUserResolver],
  exports: [UserService, UserResolver, UnregisteredUserResolver]
})
export class UserModule {}
