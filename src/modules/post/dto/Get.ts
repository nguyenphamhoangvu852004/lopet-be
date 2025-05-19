import { PostMediaInputDTO } from '~/modules/post/dto/Create'

export class GetPostOutputDTO {
  postId!: number
  accountId!: number
  content!: string
  groupId?: number | null
  postType!: string
  postMedias?: PostMediaInputDTO[]
  createdAt!: Date
  updatedAt!: Date | null
  constructor(data?: Partial<GetPostOutputDTO>) {
    Object.assign(this, data)
  }
}
