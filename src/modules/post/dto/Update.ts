import { PostMediaInputDTO } from '~/modules/post/dto/Create'

export class UpdatePostInputDTO {
  postId!: number
  owner!: number
  content!: string
  oldIdsMedia?: number[]
  postMedias?: PostMediaInputDTO[]
  scope!: string
  createdAt!: Date
  updatedAt!: Date
  constructor(data?: Partial<UpdatePostInputDTO>) {
    Object.assign(this, data)
  }
}

export class UpdatePostOutputDTO {
  owner!: number
  postId!: number
  content!: string
  postType!: string
  scope!: string
  groupId?: number
  postMedias?: PostMediaInputDTO[]
  createdAt!: Date
  updatedAt!: Date
  constructor(data?: Partial<UpdatePostOutputDTO>) {
    Object.assign(this, data)
  }
}
