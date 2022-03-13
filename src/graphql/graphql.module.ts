import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { graphqlUploadExpress } from 'graphql-upload'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'path'

const autoSchemaFile = join(process.cwd(), 'src', 'graphql', 'schema.gql')

@Module({})
export class GraphQLWithUploadModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql')
  }

  static forRoot(): DynamicModule {
    return {
      module: GraphQLWithUploadModule,
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          sortSchema: true,
          playground: false,
          autoSchemaFile,
          bodyParserConfig: false
        })
      ],
      exports: [GraphQLModule]
    }
  }
}
