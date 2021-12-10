interface InjectableProvider {
  provide: any
  useFactory: any
}

/**
 * Creates providers for injectables that return a empty object factory for the given classes, great
 * to mock the dependencies of a module being tested where the mocked dependencies dont matter
 *
 * @param providers the providers to be mocked
 * @param factory a custom factory to be applied to all providers, defaults to a empty object factory
 */
export function createEmptyMocksFor(providers: any[], factory: any = () => ({})): InjectableProvider[] {
  return providers.map(thing => ({ provide: thing, useFactory: factory }))
}
