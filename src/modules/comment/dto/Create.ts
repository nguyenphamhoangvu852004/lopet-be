export class CreateCommentInputDTO {
  accountId!: number
  content!: string
  imageUrl!: string 
  replyCommentId!: number | null
  postId!: number

  constructor(data?: Partial<CreateCommentInputDTO>) {
    Object.assign(this, data)
  }
}

export class CreateCommentOutputDTO {
  commentId!: number
  constructor(data?: Partial<CreateCommentOutputDTO>) {
    Object.assign(this, data)
  }
}
