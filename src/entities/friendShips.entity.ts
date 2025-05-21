import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'

export enum FRIENDSHIPSTATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED'
}

@Entity({ name: 'friend_ships' })
export class FriendShips extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Accounts, (account) => account.sentFriendRequests, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender!: Accounts

  @ManyToOne(() => Accounts, (account) => account.receivedFriendRequests, { eager: true })
  @JoinColumn({ name: 'receiver_id' })
  receiver!: Accounts

  @Column({
    type: 'enum',
    enum: FRIENDSHIPSTATUS,
    default: FRIENDSHIPSTATUS.PENDING
  })
  status!: FRIENDSHIPSTATUS

  constructor(data?: Partial<FriendShips>) {
    super()
    Object.assign(this, data)
  }
}
