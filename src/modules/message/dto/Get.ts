export class GetMessageOutputDTO {
  id!: number
  senderId!: number
  receiverId!: number
  content!: string
  createdAt!: Date
  status!: string
  constructor(data?: Partial<GetMessageOutputDTO>) {
    Object.assign(this, data)
  }
}
