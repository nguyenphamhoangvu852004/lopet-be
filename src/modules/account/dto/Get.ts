class Profile {
  id!: number
  fullName!: string
  phoneNumber!: string
  avatarUrl!: string
  coverUrl!: string

  constructor(data?: Partial<Profile>) {
    Object.assign(this, data)
  }
}

export class GetAccountOutputDTO {
  id!: number
  email!: string
  username!: string
  password!: string
  profile!: Profile

  constructor(data?: Partial<GetAccountOutputDTO>) {
    Object.assign(this, data)
  }
}
