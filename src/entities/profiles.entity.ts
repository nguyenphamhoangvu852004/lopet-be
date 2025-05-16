import 'reflect-metadata'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '~/entities/base.entity'

@Entity({ name: 'profiles' })
export class Profiles extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'varchar'
  })
  fullName!: string

  @Column({
    type: 'varchar'
  })
  phoneNumber!: string

  @Column({
    type: 'text'
  })
  avatarUrl!: string

  @Column({
    type: 'text'
  })
  coverUrl!: string

  constructor(data?: Partial<Profiles>) {
    super()
    Object.assign(this, data)
  }
}
