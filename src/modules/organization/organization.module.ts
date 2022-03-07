import { OrganizationResolver } from './organization.resolver'
import { OrganizationService } from './organization.service'
import { Module } from '@nestjs/common'

@Module({
  providers: [OrganizationService, OrganizationResolver],
  exports: [OrganizationService, OrganizationResolver]
})
export class OrganizationModule {}
