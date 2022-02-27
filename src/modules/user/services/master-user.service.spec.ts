import { createFakeMasterUser } from '../../../database/seeders/master-user.seeder'
import { createRepositoryMock } from '../../../../test/mocks/repository.mock'
import { MasterUserRepository } from '../repositories/master-user.repository'
import { createEmptyMocksFor } from '../../../../test/utils/mocking'
import { MasterUser } from '../entities/master-user.entity'
import { MasterUserService } from './master-user.service'
import { Test, TestingModule } from '@nestjs/testing'
import { faker } from '@mikro-orm/seeder'

describe('MasterUserService', () => {
  const createMasterUserMock = () => new MasterUser(createFakeMasterUser(faker) as any)

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

  describe('updateMasterUser', () => {
    const masterUserMock = createMasterUserMock()

    it('updates the master user', async () => {
      masterUserMock.emailVerified = true
      const updatedUser = await service.updateMasterUser(masterUserMock, { emailVerified: false })

      expect(updatedUser.emailVerified).toBe(false)
    })
  })
})
