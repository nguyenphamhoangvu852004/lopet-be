import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'
export enum MESSAGESTATUS {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

@Entity({
  name: 'messages'
})
export class Messages extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Accounts)
  @JoinColumn({ name: 'sender_id' })
  sender!: Accounts

  @ManyToOne(() => Accounts)
  @JoinColumn({ name: 'receiver_id' })
  receiver!: Accounts

  @Column({
    type: 'text'
  })
  content!: string

  @Column({
    type: 'text'
  })
  mediaUrl!: string

  @Column({
    type: 'enum',
    enum: MESSAGESTATUS,
    default: MESSAGESTATUS.SENT
  })
  status!: MESSAGESTATUS
  constructor(data?: Partial<Messages>) {
    super()
    Object.assign(this, data)
  }
}
