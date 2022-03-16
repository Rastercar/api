import { BaseRepository } from '../../../database/postgres/base/base-repository'
import { User } from '../entities/user.entity'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UserRepository extends BaseRepository<User> {}
