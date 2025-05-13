export default class CreateMessageDTO {
  senderId!: string
  receiverId!: string
  content!: string
  constructor(data?: Partial<CreateMessageDTO>) {
    Object.assign(this, data)
  }
}
