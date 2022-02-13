import { MasterUserRepository } from '../repositories/master-user.repository'
import { MasterUserService } from './master-user.service'
import { OrmModule } from '../../../database/orm.module'
import { Test, TestingModule } from '@nestjs/testing'

describe('MasterUserService', () => {
  let repository: MasterUserRepository
  let service: MasterUserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [OrmModule],
      providers: [MasterUserService]
    }).compile()

    service = module.get(MasterUserService)
    repository = module.get(MasterUserRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(repository).toBeDefined()
  })
})
