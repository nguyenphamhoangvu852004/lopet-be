import { Profiles } from '~/entities/profiles.entity'

export class UpdateAccountDTO {
  id?: number
  fullname?: string
  phoneNumber?: string
  avatarUrl?: string
  coverUrl?: string
  profile?: Profiles
  constructor(data?: Partial<UpdateAccountDTO>) {
    Object.assign(this, data)
  }
}
