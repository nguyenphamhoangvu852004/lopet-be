import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'
import { Groups } from '~/entities/groups.entity'

/**
 * Resource role — vai trò của một tài khoản BÊN TRONG một group cụ thể.
 *
 * Đây là thứ RBAC toàn cục không diễn tả được: quyền kick member hay duyệt
 * bài không phụ thuộc "bạn là ai" mà phụ thuộc "bạn là gì đối với group này".
 */
export enum GROUPMEMBERROLE {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

@Entity({ name: 'group_members' })
export class GroupMembers extends BaseEntity {
  @PrimaryColumn({ name: 'group_id', type: 'int' })
  groupId!: number

  @PrimaryColumn({ name: 'account_id', type: 'int' })
  accountId!: number

  @ManyToOne(() => Groups, (group) => group.members, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'group_id' })
  group!: Groups

  @ManyToOne(() => Accounts, (account) => account.groupMembers, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'account_id' })
  account!: Accounts

  @Column({
    type: 'enum',
    enum: GROUPMEMBERROLE,
    default: GROUPMEMBERROLE.MEMBER,
    comment: 'Thay thế cho cột groups.owner cũ — cho phép nhiều co-admin'
  })
  role!: GROUPMEMBERROLE

  @Column({
    name: 'joined_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  joinedAt!: Date

  constructor(data?: Partial<GroupMembers>) {
    super()
    Object.assign(this, data)
  }
}
