import { UnregisteredUserModel } from '../models/unregistered-user.model'
import { UnregisteredUser } from '../entities/unregistered-user.entity'
import { is, of, returns } from '../../../utils/coverage-helpers'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { UserService } from '../services/user.service'
import { MikroORM } from '@mikro-orm/core'

@Resolver(of(UnregisteredUser))
export class UnregisteredUserResolver {
  constructor(readonly orm: MikroORM, private readonly userService: UserService) {}

  @Query(returns(UnregisteredUserModel), { nullable: true })
  unregisteredUser(@Args({ name: 'uuid', type: is(String) }) uuid: string): Promise<UnregisteredUser> {
    return this.userService.unregisteredUserRepository.findOneOrFail({ uuid })
  }
}
