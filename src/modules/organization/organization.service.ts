import { OrganizationRepository } from './repositories/organization.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OrganizationService {
  constructor(readonly organizationRepository: OrganizationRepository) {}
}
