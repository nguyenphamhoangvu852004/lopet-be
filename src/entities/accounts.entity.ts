import 'reflect-metadata'
import { JoinTable, Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Advertisements } from '~/entities/advertisements.entity'
import { BaseEntity } from '~/entities/base.entity'
import { Comments } from '~/entities/comments.entity'
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

  @ManyToMany(() => Roles, (role) => role.accounts)
  @JoinTable({
    name: 'account_role', // tên bảng join
    joinColumn: {
      name: 'account_id', // field trong account_role map tới Account
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'role_id', // field trong account_role map tới Role
      referencedColumnName: 'id'
    }
  })
  roles!: Roles[]

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

  @OneToMany(() => Comments, (comment) => comment.account)
  comments!: Comments[]
  constructor(data?: Partial<Accounts>) {
    super()
    Object.assign(this, data)
  }
}
