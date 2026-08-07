import 'reflect-metadata'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '~/entities/base.entity'
import { GroupMembers } from '~/entities/groupMembers.entity'
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

  /**
   * Cột `owner` cũ đã bị bỏ.
   * Chủ group giờ là bản ghi group_members có role = OWNER, nhờ đó group có
   * thể có nhiều co-admin thay vì đúng một chủ duy nhất.
   */
  @OneToMany(() => GroupMembers, (groupMember) => groupMember.group)
  members!: GroupMembers[]

  @OneToMany(() => Posts, (post) => post.group, { nullable: true })
  posts!: Posts[]

  constructor(data?: Partial<Groups>) {
    super()
    Object.assign(this, data)
  }
}
