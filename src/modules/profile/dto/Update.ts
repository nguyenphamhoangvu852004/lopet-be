export class UpdateProfileInputDTO {
  id!: number
  fullName?: string
  phoneNumber?: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
  constructor(data?: Partial<UpdateProfileInputDTO>) {
    Object.assign(this, data)
  }
}

export class UpdateProfileOutputDTO {
  id!: number
  fullName!: string
  phoneNumber!: string
  bio!: string
  avatarUrl!: string
  coverUrl!: string
  constructor(data?: Partial<UpdateProfileOutputDTO>) {
    Object.assign(this, data)
  }
}
