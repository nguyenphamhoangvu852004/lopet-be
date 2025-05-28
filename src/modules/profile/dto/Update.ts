export class UpdateProfileInputDTO {
  id!: number
  fullName?: string
  phoneNumber?: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
  dateOfBirth?: Date
  hometown?: string
  sex?: number
  constructor(data?: Partial<UpdateProfileInputDTO>) {
    Object.assign(this, data)
  }
}

export class UpdateProfileOutputDTO {
  id!: number
  fullName!: string
  phoneNumber!: string
  bio!: string
  dateOfBirth!: Date
  hometown!: string
  sex!: number
  avatarUrl!: string
  coverUrl!: string
  constructor(data?: Partial<UpdateProfileOutputDTO>) {
    Object.assign(this, data)
  }
}
