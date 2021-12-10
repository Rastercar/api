import { UserRepository } from './user.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UserService {
  constructor(readonly userRepository: UserRepository) {}
}
