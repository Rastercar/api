import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { DataloaderService } from './data-loader/data-loader.service'
import { DataloaderModule } from './data-loader/data-loader.module'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { graphqlUploadExpress } from 'graphql-upload'
import { GraphQLModule, GraphQLWsSubscriptionsConfig } from '@nestjs/graphql'
import { join } from 'path'

const autoSchemaFile = join(process.cwd(), 'src', 'graphql', 'schema.gql')

type LooseObj = {
  [k: string]: unknown
}

const isLooseObj = (x: unknown): x is LooseObj => {
  return typeof x === 'object' && x !== null
}

const graphQlWsConfig: GraphQLWsSubscriptionsConfig = {
  onConnect: context => {
    const { connectionParams, extra } = context

    // Create a request object, similar to what would exist in a http request,
    // so that the authguards can work with the WS context without changing code
    // Note: the original WS request can be accessed on `extra.request` but graphql
    // guards work with the `req` prop
    if (connectionParams?.authToken && isLooseObj(extra)) {
      extra.req = {
        headers: { authorization: `Bearer ${connectionParams.authToken}` }
      }
    }
  }
}

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
            subscriptions: {
              'graphql-ws': graphQlWsConfig
            },
            context: ({ extra }) => {
              const ctx: Record<string, unknown> = {
                loaders: dataloaderService.createLoaders()
              }

              if (extra?.req) ctx.req = extra.req

              return ctx
            }
          })
        })
      ],
      exports: [GraphQLModule]
    }
  }
}
