import { OrganizationRepository } from '../../organization/repositories/organization.repository'
import { is, of, returns } from '../../../utils/coverage-helpers'
import { Selections } from '@jenyus-org/nestjs-graphql-utils'
import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import { UseRequestContext } from '@mikro-orm/nestjs'
import { UserModel } from '../models/user.model'
import { UserService } from '../user.service'
import { MikroORM } from '@mikro-orm/core'

@Resolver(of(UserModel))
export class UserResolver {
  constructor(readonly orm: MikroORM, private readonly userService: UserService, readonly organizationRepository: OrganizationRepository) {}

  @Query(returns(UserModel), { nullable: true })
  @UseRequestContext()
  user(
    @Args({ name: 'id', type: is(Int) }) id: number,
    @Selections('user', ['organization', 'accessLevel']) populate: string[]
  ): Promise<UserModel | null> {
    return this.userService.userRepository.findOne({ id }, { populate: populate as any })
  }
}
