import 'reflect-metadata'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable
} from 'typeorm'
import { AccountRoles } from '~/entities/accountRoles.entity'
import { BaseEntity } from '~/entities/base.entity'
import { Permissions } from '~/entities/permissions.entity'

/**
 * Platform role — CHỈ dành cho nhân sự vận hành hệ thống.
 *
 * Không có USER ở đây: "user thường" = tài khoản đã xác thực, được cấp
 * tập permission baseline, không cần bản ghi role nào.
 *
 * Không có ADS ở đây: tư cách nhà quảng cáo là account capability,
 * lưu ở bảng advertiser_profiles.
 */
export enum ROLENAME {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT'
}

@Entity('roles')
export class Roles extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'enum',
    enum: ROLENAME,
    unique: true
  })
  name!: ROLENAME

  @Column({ type: 'varchar', nullable: true })
  description!: string | null

  @ManyToMany(() => Permissions, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions!: Permissions[]

  @OneToMany(() => AccountRoles, (accountRole) => accountRole.role)
  accountRoles!: AccountRoles[]

  constructor(data?: Partial<Roles>) {
    super()
    Object.assign(this, data)
  }
}
