import { GetAccountOutputDTO } from "~/modules/account/dto/Get"

export class GetCommentOutputDTO {
  postId!: number
  comments!: CommentOutputDTO[]

  constructor(data?: Partial<GetCommentOutputDTO>) {
    Object.assign(this, data)
  }
}

export class CommentOutputDTO {
  id!: number
  account!:GetAccountOutputDTO 
  content!: string
  imageUrl!: string
  createdAt!: Date

  constructor(data?: Partial<CommentOutputDTO>) {
    Object.assign(this, data)
  }
}
