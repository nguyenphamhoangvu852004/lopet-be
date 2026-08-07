import { GetProfileOutputDTO } from '~/modules/profile/dto/Get'

/** Không có trường password — DTO này đi thẳng ra response của API */
export class GetAccountOutputDTO {
  id!: number
  email!: string
  username!: string
  roles!: string[]
  profile?: GetProfileOutputDTO | null
  constructor(data?: Partial<GetAccountOutputDTO>) {
    Object.assign(this, data)
  }
}
