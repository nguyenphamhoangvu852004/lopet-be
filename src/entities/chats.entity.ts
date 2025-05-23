import 'reflect-metadata'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '~/entities/base.entity'

@Entity({
  name: 'chats'
})
export class Chats extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'varchar',
    nullable: false
  })
  roomName!: string

  @Column({
    type: 'tinyint',
    nullable: true
  })
  isAvailable!: boolean

  constructor(data?: Partial<Chats>) {
    super()
    Object.assign(this, data)
  }
}
