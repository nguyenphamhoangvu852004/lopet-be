import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'

export enum NOTIFICATION_OBJECT_TYPE {
  POST = 'POST',
  MESSAGE = 'MESSAGE'
}

export enum NOTIFICATION_STATUS {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

@Entity({
  name: 'notifications'
})
export class Notifications extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number
  @ManyToOne(() => Accounts, { eager: false, nullable: false })
  @JoinColumn({ name: 'actorId' })
  actor!: Accounts

  @ManyToOne(() => Accounts, { eager: false, nullable: false })
  @JoinColumn({ name: 'receptorId' })
  receptor!: Accounts

  @Column({
    type: 'text',
    nullable: false
  })
  content!: string

  @Column({
    type: 'enum',
    enum: NOTIFICATION_OBJECT_TYPE,
    nullable: false
  })
  objectType!: NOTIFICATION_OBJECT_TYPE

  @Column({
    type: 'enum',
    enum: NOTIFICATION_STATUS,
    default: NOTIFICATION_STATUS.SENT,
    nullable: false
  })
  status!: NOTIFICATION_STATUS

  constructor(data?: Partial<Notifications>) {
    super()
    Object.assign(this, data)
  }
}
