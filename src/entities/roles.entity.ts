import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'

export enum ROLENAME {
  ADMIN = 'ADMIN',
  ADS = 'ADS'
}

@Entity('roles')
export class Roles extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'enum',
    enum: ROLENAME
  })
  name!: ROLENAME

  @OneToMany(() => Accounts, (account) => account.roles, { nullable: true, onDelete: 'CASCADE' })
  accounts!: Accounts[]

  constructor(data?: Partial<Roles>) {
    super()
    Object.assign(this, data)
  }
}
