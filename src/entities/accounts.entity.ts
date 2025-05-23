import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Advertisements } from '~/entities/advertisements.entity'
import { BaseEntity } from '~/entities/base.entity'
import { FriendShips } from '~/entities/friendShips.entity'
import { Groups } from '~/entities/groups.entity'
import { PostLikes } from '~/entities/postLikes.entity'
import { Posts } from '~/entities/posts.entity'
import { Profiles } from '~/entities/profiles.entity'
import { Reports } from '~/entities/reports.entity'
import { Roles } from '~/entities/roles.entity'

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

  @Column({
    type: 'tinyint',
    default: 0
  })
  isBanned!: number | null

  @OneToOne(() => Profiles, (profile) => profile.account, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile!: Profiles

  @OneToMany(() => Groups, (group) => group.owner)
  groups!: Groups[]

  @ManyToMany(() => Groups, (group) => group.members, { onDelete: 'CASCADE', nullable: true })
  memberGroups!: Groups[]

  @OneToMany(() => Posts, (post) => post.accounts, { nullable: true })
  posts!: Posts[]

  @ManyToOne(() => Roles, (role) => role.accounts, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role!: Roles

  @OneToMany(() => PostLikes, (postlikes) => postlikes.account)
  postlikes!: PostLikes[]

  @OneToMany(() => Reports, (report) => report.accounts)
  reports!: Reports[]

  @OneToMany(() => FriendShips, (friendship) => friendship.sender)
  sentFriendRequests!: FriendShips[]

  @OneToMany(() => FriendShips, (friendship) => friendship.receiver)
  receivedFriendRequests!: FriendShips[]

  @OneToMany(() => Advertisements, (advertisements) => advertisements.account)
  advertisements!: Advertisements[]

  constructor(data?: Partial<Accounts>) {
    super()
    Object.assign(this, data)
  }
}
