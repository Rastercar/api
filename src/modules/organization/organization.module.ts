import { Organization } from './entities/organization.entity'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Organization] })],
  providers: [],
  exports: []
})
export class OrganizationModule {}
