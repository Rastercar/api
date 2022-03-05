import { OrganizationResolver } from './organization.resolver'
import { Organization } from './entities/organization.entity'
import { OrganizationService } from './organization.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Organization] })],
  providers: [OrganizationService, OrganizationResolver],
  exports: [OrganizationService, OrganizationResolver]
})
export class OrganizationModule {}
