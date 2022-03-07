import * as DataLoader from 'dataloader'

/**
 * Creates a data loader to load entities by id
 */
export function createByIdLoader(repository: any) {
  return new DataLoader(async (ids: readonly number[]) => {
    const entities = await repository.find({ id: { $in: ids as number[] } } as any)
    const vehiclesMap = new Map(entities.map(entity => [(entity as any).id, entity]))
    return ids.map(id => vehiclesMap.get(id))
  })
}
