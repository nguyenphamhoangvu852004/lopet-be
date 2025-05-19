import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '~/entities/base.entity'
import { Groups } from '~/entities/groups.entity'
import { Posts } from '~/entities/posts.entity'
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

  @OneToOne(() => Profiles, (profile) => profile.account, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile!: Profiles

  @OneToMany(() => Groups, (group) => group.owner, { nullable: true, onDelete: 'CASCADE' })
  groups!: Groups[]

  @ManyToMany(() => Groups, (group) => group.members, { nullable: true })
  memberGroups!: Groups[]

  @OneToMany(() => Posts, (post) => post.accounts, { nullable: true, onDelete: 'CASCADE' })
  posts!: Posts[]
  constructor(data?: Partial<Accounts>) {
    super()
    Object.assign(this, data)
  }
}
