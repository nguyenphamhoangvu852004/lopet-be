import 'reflect-metadata'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '~/entities/base.entity'

@Entity({
  name: 'messages'
})
export class Messages extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'varchar'
  })
  senderId!: string

  @Column({
    type: 'varchar'
  })
  receiverId!: string

  @Column({
    type: 'text'
  })
  content!: string

  constructor(data?: Partial<Messages>) {
    super()
    Object.assign(this, data)
  }
}
