import * as DataLoader from 'dataloader'

/**
 * Creates a generic dataLoader that will
 *
 * TODO: fix-typing
 */
export function createDataLoader(repository: any) {
  return new DataLoader(async (ids: readonly number[]) => {
    const entities = await repository.find({ id: { $in: ids as number[] } } as any)
    const vehiclesMap = new Map(entities.map(entity => [(entity as any).id, entity]))
    return ids.map(id => vehiclesMap.get(id))
  })
}
