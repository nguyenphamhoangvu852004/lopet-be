import 'reflect-metadata'
import { Entity, BaseEntity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { Posts } from '~/entities/posts.entity'

@Entity({ name: 'post_likes' })
export class PostLikes extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Posts, (post) => post.postLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: Posts

  @ManyToOne(() => Accounts, (account) => account.postlikes, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'account_id' })
  account!: Accounts

  constructor(data?: Partial<PostLikes>) {
    super()
    Object.assign(this, data)
  }
}
