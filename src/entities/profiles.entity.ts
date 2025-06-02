import 'reflect-metadata'
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'

@Entity({ name: 'profiles' })
export class Profiles extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'varchar',
    nullable: true
  })
  fullName!: string

  @Column({
    type: 'varchar',
    nullable: true
  })
  phoneNumber!: string

  @Column({
    type: 'text',
    nullable: true
  })
  bio!: string
  @Column({
    type: 'tinyint',
    nullable: true
  })
  sex!: number
  @Column({
    type: 'date',
    nullable: true
  })
  dateOfBirth!: Date

  @Column({
    type: 'varchar',
    nullable: true
  })
  hometown!: string

  @Column({
    type: 'text',
    nullable: true
  })
  avatarUrl!: string

  @Column({
    type: 'text',
    nullable: true
  })
  coverUrl!: string

  @OneToOne(() => Accounts, (account) => account.profile)
  account!: Accounts

  constructor(data?: Partial<Profiles>) {
    super()
    Object.assign(this, data)
  }
}
