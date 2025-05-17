import 'reflect-metadata'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'

export enum GROUPTYPE {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

@Entity({ name: 'groups' })
export class Groups extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number
  @Column({
    type: 'varchar'
  })
  name!: string
  @Column({
    type: 'enum',
    enum: GROUPTYPE
  })
  type!: GROUPTYPE

  @ManyToOne(() => Accounts, { nullable: false })
  @JoinColumn({ name: 'owner' })
  owner!: Accounts

  @ManyToMany(() => Accounts, (account) => account.memberGroups)
  @JoinTable({
    name: 'group_members',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'account_id', referencedColumnName: 'id' }
  })
  members!: Accounts[]

  constructor(data?: Partial<Groups>) {
    super()
    Object.assign(this, data)
  }
}
