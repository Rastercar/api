import { GraphQLModule } from '@nestjs/graphql'
import { Module } from '@nestjs/common'
import { join } from 'path'

const autoSchemaFile = join(process.cwd(), 'src', 'graphql', 'schema.gql')

@Module({
  imports: [GraphQLModule.forRoot({ sortSchema: true, autoSchemaFile })],
  exports: [GraphQLModule]
})
export class GraphqlModule {}
