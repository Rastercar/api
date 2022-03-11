import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { SimpleOrganizationModel } from '../../organization/models/organization.model'
import { MasterUserRepository } from '../repositories/master-user.repository'
import { RequestUser } from '../../auth/decorators/request-user.decorator'
import { UserOrMasterUser } from '../../auth/models/login-response.model'
import OrganizationLoader from '../../organization/organization.loader'
import { AccessLevelModel } from '../../auth/models/access-level.model'
import AccessLevelLoader from '../../auth/loaders/access-level.loader'
import { MasterUserService } from '../services/master-user.service'
import { GqlAuthGuard } from '../../auth/guards/gql-jwt-auth.guard'
import { is, of, returns } from '../../../utils/coverage-helpers'
import { UserRepository } from '../repositories/user.repository'
import { UserOnlyGuard } from '../guards/user-only-route.guard'
import { MasterUserModel } from '../models/master-user.model'
import { MasterUser } from '../entities/master-user.entity'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { UserService } from '../services/user.service'
import { UserModel } from '../models/user.model'
import { User } from '../entities/user.entity'
import { UseGuards } from '@nestjs/common'
import { wrap } from '@mikro-orm/core'

@Resolver(of(UserModel))
export class UserResolver {
  constructor(
    readonly userService: UserService,
    readonly userRepository: UserRepository,
    readonly masterUserService: MasterUserService,
    readonly accessLevelLoader: AccessLevelLoader,
    readonly organizationLoader: OrganizationLoader,
    readonly masterUserRepository: MasterUserRepository
  ) {}

  @ResolveField(() => SimpleOrganizationModel)
  organization(@Parent() user: User): SimpleOrganizationModel | Promise<SimpleOrganizationModel> {
    if (wrap(user.organization).isInitialized()) return user.organization
    return this.organizationLoader.byId.load(user.organization.id)
  }

  @ResolveField(() => AccessLevelModel)
  accessLevel(@Parent() user: User): AccessLevelModel | Promise<AccessLevelModel> {
    if (wrap(user.accessLevel).isInitialized()) return user.accessLevel
    return this.accessLevelLoader.byUserId.load(user.id)
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns(UserOrMasterUser))
  me(@RequestUser() user: User | MasterUser): Promise<UserModel | MasterUserModel> {
    return user instanceof User
      ? this.userRepository.findOneOrFail({ id: user.id })
      : this.masterUserRepository.findOneOrFail({ id: user.id })
  }

  @Query(returns(UserModel), { nullable: true })
  user(@Args({ name: 'id', type: is(Int) }) id: number): Promise<UserModel | null> {
    return this.userRepository.findOne({ id })
  }

  @UseGuards(GqlAuthGuard, UserOnlyGuard)
  @Mutation(returns(UserModel))
  async updateMyProfile(@RequestUser() user: User, @Args('profileData') profileData: UpdateUserDTO): Promise<UserModel> {
    await this.userService.updateUser(user, profileData)
    return this.userRepository.findOneOrFail({ id: user.id })
  }
}
