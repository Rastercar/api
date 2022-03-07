import { UnregisteredUserResolver } from './resolvers/unregistered-user.resolver'
import { MasterUserService } from './services/master-user.service'
import { UserResolver } from './resolvers/user.resolver'
import { UserService } from './services/user.service'
import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UserService, MasterUserService, UserResolver, UnregisteredUserResolver],
  exports: [UserService, MasterUserService, UserResolver, UnregisteredUserResolver]
})
export class UserModule {}
