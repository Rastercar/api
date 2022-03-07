import { OrganizationService } from '../organization/organization.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('OrganizationService', () => {
  let service: OrganizationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationService]
    }).compile()

    service = module.get(OrganizationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
