import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { OrganizationModel } from '../../organization/models/organization.model'
import { MasterUserRepository } from '../repositories/master-user.repository'
import { RequestUser } from '../../auth/decorators/request-user.decorator'
import { UserOrMasterUser } from '../../auth/models/login-response.model'
import { AccessLevelModel } from '../../auth/models/access-level.model'
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

@Resolver(of(UserModel))
export class UserResolver {
  constructor(
    readonly userService: UserService,
    readonly userRepository: UserRepository,
    readonly masterUserService: MasterUserService,
    readonly masterUserRepository: MasterUserRepository
  ) {}

  @ResolveField('organization', () => OrganizationModel)
  async organization(@Parent() user: User) {
    await this.userRepository.populate(user, ['organization'])
    return user.organization
  }

  @ResolveField('accessLevel', () => AccessLevelModel)
  async accessLevel(@Parent() user: User) {
    await this.userRepository.populate(user, ['accessLevel'])
    return user.accessLevel
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns(UserOrMasterUser))
  async me(@RequestUser() user: User | MasterUser): Promise<UserModel | MasterUserModel> {
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
