import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'

export enum ACTION {
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  APPROVED = 'APPROVED'
}

export enum REPORTTYPE {
  USER = 'USER',
  GROUP = 'GROUP',
  POST = 'POST'
}

@Entity({ name: 'reports' })
export class Reports extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Accounts, (account) => account.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  accounts!: Accounts

  @Column({
    type: 'text'
  })
  reason!: string

  @Column({
    type: 'enum',
    enum: REPORTTYPE,
    nullable: false
  })
  type!: REPORTTYPE

  @Column({
    type: 'tinyint',
    nullable: false
  })
  targetId!: number

  @Column({
    type: 'enum',
    enum: ACTION,
    default: ACTION.PENDING
  })
  action!: ACTION

  constructor(data?: Partial<Reports>) {
    super()
    Object.assign(this, data)
  }
}
