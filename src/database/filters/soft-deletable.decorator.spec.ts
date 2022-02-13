import { createSoftDeletableConditionFn } from './soft-deletable.decorator'

describe('SoftDeletable decorator', () => {
  it('Queries for fields where the softdelete column is null when filter to apply is not_deleted', async () => {
    const field = 'deletedAt'
    const cond = createSoftDeletableConditionFn({ field, filterToApply: 'not_deleted' })
    expect(cond()).toStrictEqual({ [field]: null })
  })

  it('Queries for fields where the softdelete column is not null when filter to apply is deleted', async () => {
    const field = 'otherField'
    const cond = createSoftDeletableConditionFn({ field, filterToApply: 'deleted' })
    expect(cond()).toStrictEqual({ [field]: { $ne: null } })
  })

  it('Does not filter when filter to apply is undefined', async () => {
    const field = 'otherField'
    const cond = createSoftDeletableConditionFn({ field, filterToApply: undefined })
    expect(cond()).toStrictEqual({})
  })
})
