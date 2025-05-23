import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'
@Entity({ name: 'advertisements' })
export class Advertisements extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Accounts, (account) => account.advertisements, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Accounts

  @Column({ type: 'varchar', nullable: false })
  title!: string

  @Column({ type: 'text', nullable: false })
  description!: string

  @Column({ type: 'text', nullable: false })
  imageUrl!: string

  @Column({ type: 'text', nullable: false })
  linkReferfence!: string

  constructor(data?: Partial<Advertisements>) {
    super()
    Object.assign(this, data)
  }
}
