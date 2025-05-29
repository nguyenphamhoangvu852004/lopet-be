export class PostMediaInputDTO {
  mediaUrl!: string
  mediaType!: string
  createdAt!: Date
  updatedAt!: Date | null
  constructor(data?: Partial<PostMediaInputDTO>) {
    Object.assign(this, data)
  }
}
export class CreatePostInputDTO {
  accountId!: number
  content!: string
  groupId!: number
  postMedias?: PostMediaInputDTO[]
  scope!: string
  createdAt!: Date
  updatedAt!: Date
  constructor(data?: Partial<CreatePostInputDTO>) {
    Object.assign(this, data)
  }
}

export class CreatePostOutputDTO {
  accountId!: number
  postId!: number
  content!: string
  groupId!: number | null
  postType!: string
  scope!: string
  postMedias?: PostMediaInputDTO[]
  createdAt!: Date
  updatedAt!: Date
  constructor(data?: Partial<CreatePostOutputDTO>) {
    Object.assign(this, data)
  }
}
