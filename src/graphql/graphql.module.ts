import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'path'

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src', 'graphql', 'schema.gql'),
      sortSchema: true
    })
  ],
  exports: [GraphQLModule]
})
export class GraphqlModule {}
