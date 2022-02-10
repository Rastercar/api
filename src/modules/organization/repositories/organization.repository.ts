import { EntityRepository } from '@mikro-orm/postgresql'
import { Organization } from '../entities/organization.entity'

export class OrganizationRepository extends EntityRepository<Organization> {}
