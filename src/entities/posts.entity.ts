import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'
import { Comments } from '~/entities/comments.entity'
import { Groups } from '~/entities/groups.entity'
import { PostLikes } from '~/entities/postLikes.entity'
import { PostMedias } from '~/entities/postMedias.entity'

export enum POSTTYPE {
  GROUP = 'GROUP',
  USER = 'USER'
}

@Entity({ name: 'posts' })
export class Posts extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Accounts, (account) => account.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  accounts!: Accounts

  @Column({
    type: 'text'
  })
  content!: string

  @ManyToOne(() => Groups, (group) => group.posts, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'group_id' })
  group!: Groups | null

  @Column({
    type: 'enum',
    enum: POSTTYPE,
    nullable: true
  })
  postType!: POSTTYPE

  @OneToMany(() => PostMedias, (postMedias) => postMedias.post, { cascade: true })
  postMedias!: PostMedias[]

  @OneToMany(() => PostLikes, (postLikes) => postLikes.post, { cascade: true, nullable: true })
  postLikes!: PostLikes[]

  @OneToMany(() => Comments, (comment) => comment.post, { cascade: true })
  public comments!: Comments[]

  constructor(data?: Partial<Posts>) {
    super()
    Object.assign(this, data)
  }

  setType() {
    if (this.group != null) {
      this.postType = POSTTYPE.GROUP
    } else {
      this.postType = POSTTYPE.USER
    }
  }
}
