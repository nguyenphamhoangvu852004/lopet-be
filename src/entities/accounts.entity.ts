import 'reflect-metadata'
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { AccountRoles } from '~/entities/accountRoles.entity'
import { AdvertiserProfiles } from '~/entities/advertiserProfiles.entity'
import { BaseEntity } from '~/entities/base.entity'
import { Comments } from '~/entities/comments.entity'
import { FriendShips } from '~/entities/friendShips.entity'
import { GroupMembers } from '~/entities/groupMembers.entity'
import { PostLikes } from '~/entities/postLikes.entity'
import { Posts } from '~/entities/posts.entity'
import { Profiles } from '~/entities/profiles.entity'
import { Reports } from '~/entities/reports.entity'

@Entity({ name: 'accounts' })
export class Accounts extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'varchar',
    unique: true
  })
  email!: string

  @Column({
    type: 'varchar',
    unique: true
  })
  username!: string

  @Column({
    type: 'varchar',
    select: false,
    comment: 'Bcrypt hash — không bao giờ được trả ra DTO'
  })
  password!: string

  @Column({
    type: 'tinyint',
    default: 0
  })
  isBanned!: number | null

  @OneToOne(() => Profiles, (profile) => profile.account, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'profileId' })
  profile!: Profiles | null

  /* ---------- Trục 1: platform role (staff) ---------- */

  @OneToMany(() => AccountRoles, (accountRole) => accountRole.account)
  accountRoles!: AccountRoles[]

  /** Các lần tài khoản này (staff) cấp role cho người khác — phục vụ audit */
  @OneToMany(() => AccountRoles, (accountRole) => accountRole.grantedBy)
  grantedRoles!: AccountRoles[]

  /* ---------- Trục 2: account capability (nhà quảng cáo) ---------- */

  @OneToOne(
    () => AdvertiserProfiles,
    (advertiserProfile) => advertiserProfile.account,
    {
      nullable: true
    }
  )
  advertiserProfile!: AdvertiserProfiles | null

  /** Các advertiser profile mà tài khoản này (staff) đã duyệt — phục vụ audit */
  @OneToMany(
    () => AdvertiserProfiles,
    (advertiserProfile) => advertiserProfile.approvedBy
  )
  approvedAdvertisers!: AdvertiserProfiles[]

  /* ---------- Trục 3: resource role (quyền theo tài nguyên) ---------- */

  @OneToMany(() => GroupMembers, (groupMember) => groupMember.account)
  groupMembers!: GroupMembers[]

  @OneToMany(() => Posts, (post) => post.accounts, { nullable: true })
  posts!: Posts[]

  /* ---------- Quan hệ nghiệp vụ khác ---------- */

  @OneToMany(() => PostLikes, (postlikes) => postlikes.account)
  postlikes!: PostLikes[]

  @OneToMany(() => Reports, (report) => report.reporter)
  reports!: Reports[]

  /** Các báo cáo mà tài khoản này (staff) đã xử lý — phục vụ audit */
  @OneToMany(() => Reports, (report) => report.resolvedBy)
  resolvedReports!: Reports[]

  @OneToMany(() => FriendShips, (friendship) => friendship.sender)
  sentFriendRequests!: FriendShips[]

  @OneToMany(() => FriendShips, (friendship) => friendship.receiver)
  receivedFriendRequests!: FriendShips[]

  @OneToMany(() => Comments, (comment) => comment.account)
  comments!: Comments[]

  constructor(data?: Partial<Accounts>) {
    super()
    Object.assign(this, data)
  }
}
