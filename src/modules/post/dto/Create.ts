export class CreatePostInputDTO {
  accountId!: number
  content!: string
  groupId!: number
  images?: string[]
  videos?: string[]
  constructor(data?: Partial<CreatePostInputDTO>) {
    Object.assign(this, data)
  }
}

export class CreatePostOutputDTO {
  constructor(data?: Partial<CreatePostOutputDTO>) {
    Object.assign(this, data)
  }
}
