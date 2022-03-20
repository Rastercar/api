import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { DataloaderService } from './data-loader/data-loader.service'
import { DataloaderModule } from './data-loader/data-loader.module'
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
    const inDevelopmentMode = process.env.NODE_ENV === 'development'

    return {
      module: GraphQLWithUploadModule,
      imports: [
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
          inject: [DataloaderService],
          imports: [DataloaderModule],
          driver: ApolloDriver,
          useFactory: (dataloaderService: DataloaderService) => ({
            sortSchema: true,
            autoSchemaFile,
            bodyParserConfig: false,
            playground: inDevelopmentMode,
            context: () => ({
              loaders: dataloaderService.createLoaders()
            }),
            subscriptions: {
              'graphql-ws': true,
              /**
               * Graphql playground and apollo studio do not support
               * subscriptions with graphql-ws, so we can use both
               * transports while in development for it to work
               */
              'subscriptions-transport-ws': inDevelopmentMode
            }
          })
        })
      ],
      exports: [GraphQLModule]
    }
  }
}
