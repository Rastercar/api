import { EntityRepository } from '@mikro-orm/postgresql'
import { Repository } from '@mikro-orm/core'
import { Organization } from '../entities/organization.entity'

@Repository(Organization)
export class OrganizationRepository extends EntityRepository<Organization> {}
