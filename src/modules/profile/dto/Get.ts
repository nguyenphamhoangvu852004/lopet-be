export class GetListInputDTO {
  id?: number
  fullName?: string
  constructor(data?: Partial<GetListInputDTO>) {
    Object.assign(this, data)
  }
}

export class GetProfileOutputDTO {
  id!: number
  fullName!: string
  bio!: string
  phoneNumber!: string
  dateOfBirth!: Date
  hometown!: string
  sex!: number
  avatarUrl!: string
  coverUrl!: string
  constructor(data?: Partial<GetProfileOutputDTO>) {
    Object.assign(this, data)
  }
}
