import 'reflect-metadata'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '~/entities/base.entity'

export enum POSTTYPE {
  GROUP = 'GROUP',
  USER = 'USER'
}

@Entity({ name: 'posts' })
export class Posts extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'varchar'
  })
  accountId!: string

  @Column({
    type: 'text'
  })
  content!: string

  @Column({
    type: 'enum',
    enum: POSTTYPE
  })
  postType!: POSTTYPE

  constructor(data?: Partial<Posts>) {
    super()
    Object.assign(this, data)
  }
}
