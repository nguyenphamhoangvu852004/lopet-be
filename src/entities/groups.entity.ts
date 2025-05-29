import 'reflect-metadata'
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'
import { Posts } from '~/entities/posts.entity'

export enum GROUPTYPE {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

@Entity({ name: 'groups' })
export class Groups extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number
  @Column({
    type: 'varchar'
  })
  name!: string
  @Column({
    type: 'enum',
    enum: GROUPTYPE
  })
  type!: GROUPTYPE

  @Column({
    type: 'varchar',
    nullable: true
  })
  bio!: string

  @Column({
    type: 'text',
    nullable: false
  })
  coverUrl!: string

  @ManyToOne(() => Accounts, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'owner' })
  owner!: Accounts

  @ManyToMany(() => Accounts, (account) => account.memberGroups, { onDelete: 'CASCADE', nullable: true })
  @JoinTable({
    name: 'group_members',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'account_id', referencedColumnName: 'id' }
  })
  members!: Accounts[]

  @OneToMany(() => Posts, (post) => post.group, { nullable: true })
  posts!: Posts[]

  constructor(data?: Partial<Groups>) {
    super()
    Object.assign(this, data)
  }
}
