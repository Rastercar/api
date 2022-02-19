import { MasterUserRepository } from '../repositories/master-user.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MasterUserService {
  constructor(readonly masterUserRepository: MasterUserRepository) {}
}
