import { UnregisteredUserRepository } from '../repositories/unregistered-user.repository'
import { UnregisteredUserModel } from '../models/unregistered-user.model'
import { UnregisteredUser } from '../entities/unregistered-user.entity'
import { is, of, returns } from '../../../utils/coverage-helpers'
import { Args, Query, Resolver } from '@nestjs/graphql'

@Resolver(of(UnregisteredUser))
export class UnregisteredUserResolver {
  constructor(readonly unregisteredUserRepository: UnregisteredUserRepository) {}

  @Query(returns(UnregisteredUserModel), { nullable: true })
  unregisteredUser(@Args({ name: 'uuid', type: is(String) }) uuid: string): Promise<UnregisteredUser> {
    return this.unregisteredUserRepository.findOneOrFail({ uuid })
  }
}
