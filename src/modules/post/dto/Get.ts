import { PostMediaInputDTO } from '~/modules/post/dto/Create'

export class GetPostOutputDTO {
  postId!: number
  accountId!: number
  content!: string
  groupId?: number | null
  postType!: string
  postMedias?: PostMediaInputDTO[]
  likeAmount!: number
  createdAt!: Date
  updatedAt!: Date | null
  constructor(data?: Partial<GetPostOutputDTO>) {
    Object.assign(this, data)
  }
}

export class AccountDTO {
  id!: number
  username!: string
  email!: string
  constructor(data?: Partial<AccountDTO>) {
    Object.assign(this, data)
  }
}

export class GetPostDetailOutputDTO {
  postId!: number
  accountId!: number
  content!: string
  groupId?: number | null
  postType!: string
  postMedias?: PostMediaInputDTO[]
  likeAmount!: number
  commentAmount!: number
  shareAmount!: number
  listLike!: AccountDTO[]
  createdAt!: Date
  updatedAt!: Date | null
  constructor(data?: Partial<GetPostDetailOutputDTO>) {
    Object.assign(this, data)
  }
}

export class GetPostByAccountIdOutputDTO {
  postId!: number
  content!: string
  groupId?: number | null
  postType!: string
  postMedias?: PostMediaInputDTO[]
  likeAmount!: number
  commentAmount!: number
  shareAmount!: number
  listLike!: AccountDTO[]
  createdAt!: Date
  updatedAt!: Date | null
  constructor(data?: Partial<GetPostByAccountIdOutputDTO>) {
    Object.assign(this, data)
  }
}
