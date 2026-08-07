import 'reflect-metadata'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
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

  @ManyToOne(() => Accounts, (account) => account.reports, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'reporter_id' })
  reporter!: Accounts

  @Column({
    type: 'text'
  })
  reason!: string

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: REPORTTYPE,
    nullable: false
  })
  targetType!: REPORTTYPE

  @Column({
    name: 'target_id',
    type: 'int',
    nullable: false,
    comment: 'Trước đây là tinyint nên tràn ở id > 127 — đã đổi sang int'
  })
  targetId!: number

  @Column({
    type: 'enum',
    enum: ACTION,
    default: ACTION.PENDING
  })
  action!: ACTION

  /** Staff đã xử lý báo cáo này — bắt buộc để audit hành động kiểm duyệt */
  @ManyToOne(() => Accounts, (account) => account.resolvedReports, {
    onDelete: 'SET NULL',
    nullable: true
  })
  @JoinColumn({ name: 'resolved_by' })
  resolvedBy!: Accounts | null

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt!: Date | null

  constructor(data?: Partial<Reports>) {
    super()
    Object.assign(this, data)
  }
}
