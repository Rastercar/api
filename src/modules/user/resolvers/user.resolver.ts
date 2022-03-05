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
import { Selections } from '@jenyus-org/nestjs-graphql-utils'
import { MasterUserModel } from '../models/master-user.model'
import { MasterUser } from '../entities/master-user.entity'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { UserService } from '../services/user.service'
import { UserModel } from '../models/user.model'
import { User } from '../entities/user.entity'
import { UseGuards } from '@nestjs/common'
import { union } from 'lodash'

// List of dot notation relationships to optimize when querying
// a user (when the UserModel) is the query root entity
//
// this will avoid most trouble with
const _USER_FIELD = [
  'accessLevel',
  'organization',
  'organization.trackers',
  // 'organization.trackers.vehicle',
  'organization.simCards',
  'organization.vehicles',
  'organization.vehicles.trackers',
  'organization.vehicles.trackers.simCards'
] as const
const USER_FIELDS = _USER_FIELD as unknown as string[]
type userField = typeof _USER_FIELD[number]

const _MASTER_USER_FIELD = ['masterAccessLevel', 'accessLevel'] as const
const MASTER_USER_FIELDS = _MASTER_USER_FIELD as unknown as string[]
type masterUserField = typeof _MASTER_USER_FIELD[number]

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
  async me(
    @RequestUser() user: User | MasterUser,
    @Selections('me', union(USER_FIELDS, MASTER_USER_FIELDS)) populate: string[]
  ): Promise<UserModel | MasterUserModel> {
    if (populate.length === 0) return user

    const isUser = user instanceof User

    populate = isUser ? populate.filter(field => USER_FIELDS.includes(field)) : populate.filter(field => MASTER_USER_FIELDS.includes(field))

    return isUser
      ? this.userRepository.findOneOrFail({ id: user.id }, { populate: populate as userField[] })
      : this.masterUserRepository.findOneOrFail({ id: user.id }, { populate: populate as masterUserField[] })
  }

  @Query(returns(UserModel), { nullable: true })
  user(@Args({ name: 'id', type: is(Int) }) id: number, @Selections('user', USER_FIELDS) populate: userField[]): Promise<UserModel | null> {
    return this.userRepository.findOne({ id }, { populate })
  }

  @UseGuards(GqlAuthGuard, UserOnlyGuard)
  @Mutation(returns(UserModel))
  async updateMyProfile(
    @RequestUser() user: User,
    @Args('profileData') profileData: UpdateUserDTO,
    @Selections('updateMyProfile', USER_FIELDS) populate: userField[]
  ): Promise<UserModel> {
    await this.userService.updateUser(user, profileData)
    return this.userRepository.findOneOrFail({ id: user.id }, { populate: populate as any })
  }
}
