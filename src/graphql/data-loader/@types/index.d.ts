import type { IDataLoaders } from '../data-loader.service'

declare global {
  interface IGraphQLContext {
    loaders: IDataLoaders
  }
}
