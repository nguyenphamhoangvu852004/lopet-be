import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'
import { Groups } from '~/entities/groups.entity'

export enum POSTTYPE {
  GROUP = 'GROUP',
  USER = 'USER'
}

@Entity({ name: 'posts' })
export class Posts extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Accounts, (account) => account.posts)
  @JoinColumn({ name: 'account_id' })
  accounts!: Accounts

  @Column({
    type: 'text'
  })
  content!: string

  @ManyToOne(() => Groups, (group) => group.posts, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group!: Groups | null

  @Column({
    type: 'enum',
    enum: POSTTYPE
  })
  postType!: POSTTYPE

  constructor(data?: Partial<Posts>) {
    super()
    Object.assign(this, data)
  }
  setType() {
    if (this.group != null) {
      this.postType = POSTTYPE.GROUP
    }
  }
  getType() {
    return this.postType
  }
}
