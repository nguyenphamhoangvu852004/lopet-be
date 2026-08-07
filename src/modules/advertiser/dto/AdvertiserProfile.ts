import { ADVERTISERSTATUS } from '~/entities/advertiserProfiles.entity'

export class RegisterAdvertiserInputDTO {
  /** Luôn lấy từ req.user, không nhận từ body */
  accountId!: number
  companyName!: string
  constructor(data?: Partial<RegisterAdvertiserInputDTO>) {
    Object.assign(this, data)
  }
}

export class ReviewAdvertiserInputDTO {
  profileId!: number
  status!: ADVERTISERSTATUS
  /** Staff thực hiện thao tác duyệt — lấy từ req.user */
  reviewerId!: number
  constructor(data?: Partial<ReviewAdvertiserInputDTO>) {
    Object.assign(this, data)
  }
}

export class AdvertiserProfileOutputDTO {
  id!: number
  accountId!: number
  username?: string
  companyName!: string | null
  status!: ADVERTISERSTATUS
  balance!: number
  dailyLimit!: number | null
  approvedById?: number | null
  approvedAt!: Date | null
  createdAt!: Date
  constructor(data?: Partial<AdvertiserProfileOutputDTO>) {
    Object.assign(this, data)
  }
}
