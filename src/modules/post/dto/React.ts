export class LikePostInputDTO {
  postId!: number
  accountId!: number
  constructor(data?: Partial<LikePostInputDTO>) {
    Object.assign(this, data)
  }
}

export class LikePostOuputDTO {
  message!: string

  constructor(data?: Partial<LikePostOuputDTO>) {
    Object.assign(this, data)
  }
}

export class UnlikePostInputDTO {
  postId!: number
  accountId!: number
  constructor(data?: Partial<UnlikePostInputDTO>) {
    Object.assign(this, data)
  }
}

export class UnlikePostOutputDTO {
  message!: string
  constructor(data?: Partial<UnlikePostOutputDTO>) {
    Object.assign(this, data)
  }
}
