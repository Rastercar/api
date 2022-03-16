import { PrimaryKey, Property, BaseEntity as Base } from '@mikro-orm/core'

export abstract class BaseEntity extends Base<BaseEntity, 'id'> {
  @PrimaryKey()
  id!: number

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date = new Date()
}
