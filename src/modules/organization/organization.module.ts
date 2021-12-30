import { Organization } from './entities/organization.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { OrganizationService } from './organization.service'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Organization] })],
  providers: [OrganizationService],
  exports: [OrganizationService]
})
export class OrganizationModule {}
