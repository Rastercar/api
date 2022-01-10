import { OrganizationRepository } from './repositories/organization.repository'
import { OrganizationService } from '../organization/organization.service'
import { createEmptyMocksFor } from '../../../test/utils/mocking'
import { Test, TestingModule } from '@nestjs/testing'

describe('OrganizationService', () => {
  let service: OrganizationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationService, ...createEmptyMocksFor([OrganizationRepository])]
    }).compile()

    service = module.get(OrganizationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
