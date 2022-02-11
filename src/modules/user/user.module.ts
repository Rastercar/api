import { UnregisteredUserResolver } from './resolvers/unregistered-user.resolver'
import { Organization } from '../organization/entities/organization.entity'
import { UnregisteredUser } from './entities/unregistered-user.entity'
import { MasterUserService } from './services/master-user.service'
import { MasterUser } from './entities/master-user.entity'
import { UserResolver } from './resolvers/user.resolver'
import { UserService } from './services/user.service'
import { forwardRef, Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { AuthModule } from '../auth/auth.module'
import { User } from './entities/user.entity'

@Module({
  imports: [forwardRef(() => AuthModule), MikroOrmModule.forFeature({ entities: [User, UnregisteredUser, Organization, MasterUser] })],
  providers: [UserService, MasterUserService, UserResolver, UnregisteredUserResolver],
  exports: [UserService, MasterUserService, UserResolver, UnregisteredUserResolver]
})
export class UserModule {}
