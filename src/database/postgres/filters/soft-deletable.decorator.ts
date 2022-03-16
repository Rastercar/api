import { Filter } from '@mikro-orm/core'

type filterFor = 'deleted' | 'not_deleted'

export type SoftDeleteOptions = {
  /**
   * The name of the field representing the deletedAt column (default: deletedAt)
   */
  field?: string
  /**
   * If the decorated entity should have be filtered with deletedAt = null by default
   */
  enabled?: boolean
  /**
   * The filter to apply on queries, if undefined will query for deleted and non deleted records
   */
  filterToApply?: filterFor
}

const defaultOptions = { enabled: true, filterToApply: 'not_deleted' as const, field: 'deletedAt' }

export const createSoftDeletableConditionFn = (options: { field: string; filterToApply?: filterFor }) => () => {
  const { field, filterToApply } = options

  const deletedFieldIsNotNull = { [field]: { $ne: null } }
  const deletedFieldIsNull = { [field]: null }

  if (filterToApply === 'deleted') return deletedFieldIsNotNull
  return filterToApply === 'not_deleted' ? deletedFieldIsNull : {}
}

/**
 * Marks a entity as soft deletable
 *
 * ```ts
 * await this.em.find(User, {}) // only returns active records
 * await this.em.find(User, {}, { filters: { softDelete: { isDeleted: true } } }) // returns deleted records
 * await this.em.find(User, {}, { filters: { softDelete: { isDeleted: null } } }) // returns all
 * ```
 */
export const SoftDeletable = (options: SoftDeleteOptions = {}): ClassDecorator => {
  const { enabled, filterToApply, field } = { ...defaultOptions, ...options }

  return Filter({
    name: 'softDelete',
    args: false,
    default: enabled,
    cond: createSoftDeletableConditionFn({ field, filterToApply })
  })
}
