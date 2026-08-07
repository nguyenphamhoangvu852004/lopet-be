import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'
import { Roles } from '~/entities/roles.entity'

/**
 * Bảng nối account <-> role, khai báo tường minh (không dùng @JoinTable ngầm)
 * vì cần thêm cột audit: ai cấp quyền và cấp lúc nào.
 */
@Entity({ name: 'account_role' })
export class AccountRoles extends BaseEntity {
  @PrimaryColumn({ name: 'account_id', type: 'int' })
  accountId!: number

  @PrimaryColumn({ name: 'role_id', type: 'int' })
  roleId!: number

  @ManyToOne(() => Accounts, (account) => account.accountRoles, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'account_id' })
  account!: Accounts

  @ManyToOne(() => Roles, (role) => role.accountRoles, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'role_id' })
  role!: Roles

  @ManyToOne(() => Accounts, (account) => account.grantedRoles, {
    onDelete: 'SET NULL',
    nullable: true
  })
  @JoinColumn({ name: 'granted_by' })
  grantedBy!: Accounts | null

  @Column({
    name: 'granted_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Thời điểm role được cấp cho tài khoản'
  })
  grantedAt!: Date

  constructor(data?: Partial<AccountRoles>) {
    super()
    Object.assign(this, data)
  }
}
