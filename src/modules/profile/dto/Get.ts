export class GetProfileOutputDTO {
  id!: number
  fullName!: string
  bio!: string
  phoneNumber!: string
  avatarUrl!: string
  coverUrl!: string
  constructor(data?: Partial<GetProfileOutputDTO>) {
    Object.assign(this, data)
  }
}
