import { forwardRef, Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { MasterUserResolver } from './resolvers/master-user.resolver'
import { UnregisteredUserResolver } from './resolvers/unregistered-user.resolver'
import { UserResolver } from './resolvers/user.resolver'
import { MasterUserService } from './services/master-user.service'
import { UserService } from './services/user.service'

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UserService, MasterUserService, UserResolver, MasterUserResolver, UnregisteredUserResolver],
  exports: [UserService, MasterUserService, UserResolver, MasterUserResolver, UnregisteredUserResolver]
})
export class UserModule {}
