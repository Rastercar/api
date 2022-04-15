import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { GraphQLModule, GraphQLWsSubscriptionsConfig } from '@nestjs/graphql'
import { Request } from 'express'
import { graphqlUploadExpress } from 'graphql-upload'
import { join } from 'path'
import { DataloaderModule } from './data-loader/data-loader.module'
import { DataloaderService } from './data-loader/data-loader.service'

const autoSchemaFile = join(process.cwd(), 'src', 'graphql', 'schema.gql')

type LooseObj = {
  [k: string]: unknown
}

const isLooseObj = (x: unknown): x is LooseObj => {
  return typeof x === 'object' && x !== null
}

const graphQlWsConfig: GraphQLWsSubscriptionsConfig = {
  // see: https://docs.nestjs.com/graphql/subscriptions#subscriptions
  onConnect: context => {
    const { connectionParams, extra } = context

    // If context is not a object we cannot pass it to the graphql context,
    // just accept the connection
    if (!isLooseObj(extra)) return true

    // Create a request object, similar to what would exist in a http request,
    // so that the authguards can work with the WS context without changing code
    // Note: the original WS request can be accessed on `extra.request` but graphql
    // guards work with the `req` prop
    const req: Pick<Request, 'headers'> = { headers: {} }

    if (connectionParams?.authToken) req.headers.authorization = `Bearer ${connectionParams.authToken}`

    if (connectionParams?.organizationid) {
      req.headers.organizationid = `${connectionParams.organizationid}`
    }

    extra.req = req
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
              const graphqlRequestContext: Record<string, unknown> = {
                loaders: dataloaderService.createLoaders()
              }

              if (extra?.req) graphqlRequestContext.req = extra.req

              // Pass the socket itself for handler closing on errors, etc
              // this is essential for the global exception filter
              if (extra?.socket) graphqlRequestContext.socket = extra.socket

              return graphqlRequestContext
            }
          })
        })
      ],
      exports: [GraphQLModule]
    }
  }
}
