import { MasterUserRepository } from '../repositories/master-user.repository'
import { Injectable } from '@nestjs/common'
import { MikroORM } from '@mikro-orm/core'

@Injectable()
export class MasterUserService {
  constructor(
    // This is not used but is required because @UseRequestContext needs mikroorm in its context
    readonly orm: MikroORM,
    readonly masterUserRepository: MasterUserRepository
  ) {}
}
