export class DeleteCommentInputDTO {
  owner!: number
  commentId!: number
  constructor(data?: Partial<DeleteCommentInputDTO>) {
    Object.assign(this, data)
  }
}
export class DeleteCommentOutputDTO {
  commentId!: number
  constructor(data?: Partial<DeleteCommentOutputDTO>) {
    Object.assign(this, data)
  }
}
