import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { BaseEntity } from '~/entities/base.entity'
import { Posts } from '~/entities/posts.entity'

@Entity('comments')
export class Comments extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'text' })
  text!: string

  // @Column({ type: 'int', unsigned: true })
  // lft!: number

  // @Column({ type: 'int', unsigned: true })
  // rgt!: number

  @ManyToOne(() => Comments, (comment) => comment.replies, {
    onDelete: 'CASCADE', // Khi comment cha bị xoá, comment con cũng bị xoá
    nullable: true
  })
  @JoinColumn({ name: 'parentId' })
  parent!: Comments | null

  @OneToMany(() => Comments, (comment) => comment.parent, { cascade: true })
  replies!: Comments[]

  @Column({ type: 'text', nullable: true })
  images!: string

  @ManyToOne(() => Posts, (post) => post.comments, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'post_id' })
  post!: Posts

  @ManyToOne(() => Accounts, (account) => account.comments, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'account_id' })
  account!: Accounts

  constructor(data?: Partial<Comments>) {
    super()
    Object.assign(this, data)
  }
}
