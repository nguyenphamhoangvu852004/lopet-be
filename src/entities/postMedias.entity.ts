import 'reflect-metadata'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '~/entities/base.entity'
import { Posts } from '~/entities/posts.entity'

export enum MEDIATYPE {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE'
}

@Entity({ name: 'post_medias' })
export class PostMedias extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'text'
  })
  mediaUrl!: string
  @Column({
    type: 'enum',
    enum: MEDIATYPE
  })
  mediaType!: MEDIATYPE

  @ManyToOne(() => Posts, (post) => post.postMedias, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'post_id' })
  post!: Posts

  constructor(data?: Partial<PostMedias>) {
    super()
    Object.assign(this, data)
  }
}
