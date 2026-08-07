import 'reflect-metadata'
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '~/entities/base.entity'
import { Roles } from '~/entities/roles.entity'

export enum PERMISSIONSCOPE {
  /** Được thực hiện hành động trên mọi tài nguyên */
  ANY = 'ANY',
  /** Chỉ được thực hiện trên tài nguyên do chính mình sở hữu */
  OWN = 'OWN'
}

@Entity({ name: 'permissions' })
export class Permissions extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'varchar',
    unique: true,
    comment: "Mã quyền dạng 'resource:action' hoặc 'resource:action:own'"
  })
  code!: string

  @Column({
    type: 'varchar',
    comment: "Tài nguyên bị tác động, ví dụ 'ads', 'account', 'group'"
  })
  resource!: string

  @Column({
    type: 'varchar',
    comment: "Hành động, ví dụ 'create', 'update', 'delete', 'ban'"
  })
  action!: string

  @Column({
    type: 'enum',
    enum: PERMISSIONSCOPE,
    default: PERMISSIONSCOPE.ANY,
    comment: 'OWN nghĩa là phải qua thêm tầng kiểm tra ownership'
  })
  scope!: PERMISSIONSCOPE

  @Column({ type: 'varchar', nullable: true })
  description!: string | null

  @ManyToMany(() => Roles, (role) => role.permissions)
  roles!: Roles[]

  constructor(data?: Partial<Permissions>) {
    super()
    Object.assign(this, data)
  }
}
