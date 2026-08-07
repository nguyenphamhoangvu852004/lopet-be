import { Accounts } from '~/entities/accounts.entity'
import {
  ADVERTISERSTATUS,
  AdvertiserProfiles
} from '~/entities/advertiserProfiles.entity'
import { BadRequest, Conflict, NotFound } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import {
  AdvertiserProfileOutputDTO,
  RegisterAdvertiserInputDTO,
  ReviewAdvertiserInputDTO
} from '~/modules/advertiser/dto/AdvertiserProfile'
import IAdvertiserProfileRepo from '~/modules/advertiser/repositories/IAdvertiserProfileRepo'
import IAdvertiserProfileService from '~/modules/advertiser/services/IAdvertiserProfileService'

/**
 * Vòng đời tư cách nhà quảng cáo — thứ thay thế cho role 'ADS' cũ.
 *
 *   đăng ký -> PENDING -> (staff duyệt) -> APPROVED -> (vi phạm) -> SUSPENDED
 *
 * Chỉ APPROVED mới tạo được quảng cáo. Một enum role không thể mang được
 * chuỗi trạng thái này, đó là lý do nó phải là bảng riêng chứ không phải role.
 */
export default class AdvertiserProfileServiceImpl
  implements IAdvertiserProfileService
{
  constructor(
    private advertiserRepo: IAdvertiserProfileRepo,
    private accountRepo: IAccountRepo
  ) {
    this.advertiserRepo = advertiserRepo
    this.accountRepo = accountRepo
  }

  private toDto(profile: AdvertiserProfiles): AdvertiserProfileOutputDTO {
    return new AdvertiserProfileOutputDTO({
      id: profile.id,
      accountId: profile.account?.id,
      username: profile.account?.username,
      companyName: profile.companyName,
      status: profile.status,
      balance: profile.balance,
      dailyLimit: profile.dailyLimit,
      approvedById: profile.approvedBy?.id ?? null,
      approvedAt: profile.approvedAt,
      createdAt: profile.createdAt
    })
  }

  async register(
    data: RegisterAdvertiserInputDTO
  ): Promise<AdvertiserProfileOutputDTO> {
    const account = await this.accountRepo.findById(data.accountId)
    if (!account) throw new NotFound('Không tìm thấy tài khoản')

    const existed = await this.advertiserRepo.findByAccountId(data.accountId)
    if (existed) {
      throw new Conflict('Tài khoản đã có hồ sơ nhà quảng cáo')
    }
    if (!data.companyName) {
      throw new BadRequest('Thiếu companyName')
    }

    // Luôn tạo ở PENDING — tự đăng ký không đồng nghĩa được chạy quảng cáo
    const created = await this.advertiserRepo.create(
      new AdvertiserProfiles({
        account: account,
        companyName: data.companyName,
        status: ADVERTISERSTATUS.PENDING,
        balance: 0,
        createdAt: new Date()
      })
    )
    return this.toDto(created)
  }

  async getMine(accountId: number): Promise<AdvertiserProfileOutputDTO> {
    const profile = await this.advertiserRepo.findByAccountId(accountId)
    if (!profile) throw new NotFound('Bạn chưa có hồ sơ nhà quảng cáo')
    return this.toDto(profile)
  }

  async getList(): Promise<AdvertiserProfileOutputDTO[]> {
    const list = await this.advertiserRepo.findAll()
    return list.map((profile) => this.toDto(profile))
  }

  async review(
    data: ReviewAdvertiserInputDTO
  ): Promise<AdvertiserProfileOutputDTO> {
    const profile = await this.advertiserRepo.findById(data.profileId)
    if (!profile) throw new NotFound('Không tìm thấy hồ sơ nhà quảng cáo')

    if (!Object.values(ADVERTISERSTATUS).includes(data.status)) {
      throw new BadRequest(`Trạng thái không hợp lệ: ${data.status}`)
    }

    profile.status = data.status
    // Ghi lại staff nào đã ra quyết định — cột audit của bảng này
    profile.approvedBy = { id: data.reviewerId } as Accounts
    profile.approvedAt = new Date()

    const updated = await this.advertiserRepo.update(profile)
    const reloaded = await this.advertiserRepo.findById(updated.id)
    return this.toDto(reloaded ?? updated)
  }
}
