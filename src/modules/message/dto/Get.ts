export class GetMessageOutputDTO {
  id!: number
  senderId!: number
  receiverId!: number
  content!: string
  mediaUrl?: string
  createdAt!: Date
  status!: string
  constructor(data?: Partial<GetMessageOutputDTO>) {
    Object.assign(this, data)
  }
}

export class GetListMessageInputDTO {
  senderId!: number
  receiverId!: number
  page!: number
  limit!: number

  constructor(data?: Partial<GetListMessageInputDTO>) {
    Object.assign(this, data)
  }
}

export class GetListMessageOutputDTO {
  senderId!: number
  receiverId!: number
  content!: string
  status!: string
  createdAt!: Date
  page!: number
  limit!: number

  constructor(data?: Partial<GetListMessageInputDTO>) {
    Object.assign(this, data)
  }
}
