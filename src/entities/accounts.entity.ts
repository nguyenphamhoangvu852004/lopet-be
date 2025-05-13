import 'reflect-metadata'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '~/entities/base.entity'

@Entity({ name: 'accounts' })
export class Accounts extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number
  @Column({
    type: 'varchar'
  })
  username!: string
  @Column({
    type: 'varchar'
  })
  password!: string

  constructor(data?: Partial<Accounts>) {
    super()
    Object.assign(this, data)
  }
}
