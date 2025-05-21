import 'reflect-metadata'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'

export enum ROLENAME {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ADS = 'ADS'
}

@Entity({ name: 'roles' })
export class Roles extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'enum',
    enum: ROLENAME
  })
  name!: ROLENAME

  @OneToMany(() => Accounts, (account) => account.role, { nullable: true, onDelete: 'CASCADE' })
  accounts!: Accounts[]

  constructor(data?: Partial<Roles>) {
    super()
    Object.assign(this, data)
  }
}
