import { PrimaryKey, Property, BaseEntity as Ba } from '@mikro-orm/core'

export abstract class BaseEntity extends Ba<BaseEntity, 'id'> {
  @PrimaryKey()
  id!: number

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date = new Date()
}
