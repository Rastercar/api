import { UnregisteredUserResolver } from './resolvers/unregistered-user.resolver'
import { Organization } from '../organization/entities/organization.entity'
import { UnregisteredUser } from './entities/unregistered-user.entity'
import { MasterUserResolver } from './resolvers/master-user.resolver'
import OrganizationLoader from '../organization/organization.loader'
import { MasterUserService } from './services/master-user.service'
import { MasterUser } from './entities/master-user.entity'
import { UserResolver } from './resolvers/user.resolver'
import { UserService } from './services/user.service'
import { forwardRef, Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { AuthModule } from '../auth/auth.module'
import { User } from './entities/user.entity'
import AccessLevelLoader from '../auth/loaders/access-level.loader'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MikroOrmModule.forFeature({ entities: [User, UnregisteredUser, Organization, MasterUser] }, 'postgres')
  ],
  providers: [
    UserService,
    MasterUserService,
    UserResolver,
    MasterUserResolver,
    UnregisteredUserResolver,
    AccessLevelLoader,
    OrganizationLoader
  ],
  exports: [UserService, MasterUserService, UserResolver, MasterUserResolver, UnregisteredUserResolver]
})
export class UserModule {}
