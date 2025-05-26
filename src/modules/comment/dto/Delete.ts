export class DeleteCommentOutputDTO {
  commentId!: number
  constructor(data?: Partial<DeleteCommentOutputDTO>) {
    Object.assign(this, data)
  }
}
