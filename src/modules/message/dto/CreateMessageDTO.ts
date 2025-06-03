export class CreateMessageInputDTO {
  senderId!: string
  receiverId!: string
  content!: string
  imageUrl?: string
  constructor(data?: Partial<CreateMessageInputDTO>) {
    Object.assign(this, data)
  }
}

export class CreateMessageOutputDTO {
  senderId!: string
  receiverId!: string
  content!: string
  constructor(data?: Partial<CreateMessageOutputDTO>) {
    Object.assign(this, data)
  }
}
