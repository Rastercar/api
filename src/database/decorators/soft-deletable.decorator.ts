import { Filter } from '@mikro-orm/core'

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
   * If the default value for the "deletedAt" condition to filter for decorated entity should
   */
  defaultIsDeleted?: boolean
}

const defaultOptions = { enabled: true, defaultIsDeleted: false, field: 'deletedAt' }

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
  const { enabled, defaultIsDeleted, field } = { ...defaultOptions, ...options }

  return Filter({
    name: 'softDelete',
    args: false,
    default: enabled,
    cond: ({ isDeleted = defaultIsDeleted }: { isDeleted?: boolean } = {}) => {
      const notNull = { [field]: { $ne: null } }
      const isNull = { [field]: null }

      if (isDeleted) return notNull
      return isDeleted === false ? isNull : {}
    }
  })
}
