import { PrimaryKey, Property } from '@mikro-orm/core'

export abstract class BaseEntity {
  @PrimaryKey()
  id!: number

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date = new Date()
}
