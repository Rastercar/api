import { UnregisteredUserModel } from '../models/unregistered-user.model'
import { UnregisteredUser } from '../entities/unregistered-user.entity'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { UserService } from '../user.service'

@Resolver(of => UnregisteredUser)
export class UnregisteredUserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(returns => UnregisteredUserModel, { nullable: true })
  unregisteredUser(@Args({ name: 'uuid', type: () => String }) uuid: string): Promise<UnregisteredUser> {
    return this.userService.unregisteredUserRepository.findOneOrFail({ uuid })
  }
}
