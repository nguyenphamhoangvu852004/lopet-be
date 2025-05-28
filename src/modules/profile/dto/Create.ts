export class CreateProfileInputDTO {
  fullName?: string
  phoneNumber?: string
  bio?: string
  dateOfBirth?: Date
  hometown?: string
  sex?: number
  avatarUrl?: string
  coverUrl?: string
  constructor(data?: Partial<CreateProfileInputDTO>) {
    Object.assign(this, data)
  }
}

export class CreateProfileOutputDTO {
  id!: number
  fullName!: string
  bio!: string
  dateOfBirth!: Date
  hometown!: string
  sex!: number
  phoneNumber!: string
  avatarUrl!: string
  coverUrl!: string
  constructor(data?: Partial<CreateProfileOutputDTO>) {
    Object.assign(this, data)
  }
}
