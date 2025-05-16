import { GetProfileOutputDTO } from '~/modules/profile/dto/Get'

export class GetAccountOutputDTO {
  id!: number
  email!: string
  username!: string
  password!: string
  profile!: GetProfileOutputDTO

  constructor(data?: Partial<GetAccountOutputDTO>) {
    Object.assign(this, data)
  }
}
