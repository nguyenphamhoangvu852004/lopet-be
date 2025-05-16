export class CreateProfileDTO {
  fullName!: string
  phoneNumber!: string
  avatarUrl!: string
  coverUrl!: string
  constructor(data?: Partial<CreateProfileDTO>) {
    Object.assign(this, data)
  }
}
