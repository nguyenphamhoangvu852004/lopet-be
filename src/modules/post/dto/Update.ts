import { PostMediaInputDTO } from '~/modules/post/dto/Create'

export class UpdatePostInputDTO {
  postId!: number
  accountId!: number
  content!: string
  postMedias?: PostMediaInputDTO[]
  scope!: string
  createdAt!: Date
  updatedAt!: Date
  constructor(data?: Partial<UpdatePostInputDTO>) {
    Object.assign(this, data)
  }
}

export class UpdatePostOutputDTO {
  accountId!: number
  postId!: number
  content!: string
  postType!: string
  scope!: string
  postMedias?: PostMediaInputDTO[]
  createdAt!: Date
  updatedAt!: Date
  constructor(data?: Partial<UpdatePostOutputDTO>) {
    Object.assign(this, data)
  }
}
