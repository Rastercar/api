import { createRepositoryMock } from '../../../../test/mocks/repository.mock'
import { MasterUserRepository } from '../repositories/master-user.repository'
import { createEmptyMocksFor } from '../../../../test/utils/mocking'
import { MasterUserService } from './master-user.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('MasterUserService', () => {
  let repository: MasterUserRepository
  let service: MasterUserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MasterUserService, ...createEmptyMocksFor([MasterUserRepository], createRepositoryMock)]
    }).compile()

    service = module.get(MasterUserService)
    repository = module.get(MasterUserRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(repository).toBeDefined()
  })
})
