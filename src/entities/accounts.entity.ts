import 'reflect-metadata'
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '~/entities/base.entity'
import { Profiles } from '~/entities/profiles.entity'

@Entity({ name: 'accounts' })
export class Accounts extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number
  @Column({
    type: 'varchar'
  })
  email!: string
  @Column({
    type: 'varchar'
  })
  username!: string
  @Column({
    type: 'varchar'
  })
  password!: string

  @JoinColumn({ name: 'profileId' })
  @OneToOne(() => Profiles)
  profile!: Profiles

  constructor(data?: Partial<Accounts>) {
    super()
    Object.assign(this, data)
  }
}
