import { Advertisements } from '~/entities/advertisements.entity'
import {
  ADVERTISERSTATUS,
  AdvertiserProfiles
} from '~/entities/advertiserProfiles.entity'
import { BadRequest, Forbidden, NotFound } from '~/error/error.custom'
import {
  CreateAdvertsementInputDTO,
  CreateAdvertsementOutputDTO
} from '~/modules/advertisement/dto/Create'
import { DeleteAdvertsementOutputDTO } from '~/modules/advertisement/dto/Delete'
import {
  Author,
  GetDetailAdvertisementOutputDTO
} from '~/modules/advertisement/dto/Get'
import {
  UpdateAdvertsementInputDTO,
  UpdateAdvertsementOutputDTO
} from '~/modules/advertisement/dto/Update'
import { IAdvertisementRepositories } from '~/modules/advertisement/repositories/IAdvertisementRepositories'
import { IAdvertisementService } from '~/modules/advertisement/services/IAdvertisementService'
import IAdvertiserProfileRepo from '~/modules/advertiser/repositories/IAdvertiserProfileRepo'

export class AdvertisementServiceImpl implements IAdvertisementService {
  constructor(
    private advertisementRepo: IAdvertisementRepositories,
    private advertiserRepo: IAdvertiserProfileRepo
  ) {
    this.advertisementRepo = advertisementRepo
    this.advertiserRepo = advertiserRepo
  }

  /**
   * Tầng CAPABILITY: thay cho câu hỏi cũ "có role ADS không?".
   * Role không diễn tả được trạng thái duyệt, nên phải hỏi advertiser_profiles.
   */
  private async requireApprovedAdvertiser(
    accountId: number
  ): Promise<AdvertiserProfiles> {
    const profile = await this.advertiserRepo.findByAccountId(accountId)
    if (!profile) {
      throw new Forbidden('Tài khoản chưa đăng ký hồ sơ nhà quảng cáo')
    }
    if (profile.status !== ADVERTISERSTATUS.APPROVED) {
      throw new Forbidden(
        `Hồ sơ nhà quảng cáo đang ở trạng thái ${profile.status}`
      )
    }
    return profile
  }

  /**
   * OWNERSHIP được kiểm ở middleware requireOwnership trên route, không lặp lại
   * ở đây. Lý do: middleware cho ADMIN đi qua, còn kiểm tra tại service lại đòi
   * người thao tác phải có advertiser_profile — admin không có nên sẽ bị chặn
   * ngược. Đặt ownership ở đúng một chỗ để hai tầng không đá nhau.
   */
  private async loadAds(adsId: number): Promise<Advertisements> {
    const ads = await this.advertisementRepo.findById(adsId)
    if (!ads) throw new NotFound('Không tìm thấy quảng cáo')
    return ads
  }

  private toDetailDto(ads: Advertisements): GetDetailAdvertisementOutputDTO {
    const author = new Author({
      id: ads.advertiser.account.id,
      email: ads.advertiser.account.email,
      username: ads.advertiser.account.username
    })
    return new GetDetailAdvertisementOutputDTO({
      createdAt: ads.createdAt,
      updatedAt: ads.updatedAt ?? undefined,
      deletedAt: ads.deletedAt ?? undefined,
      description: ads.description,
      id: ads.id,
      imageUrl: ads.imageUrl,
      linkReferfence: ads.linkReference,
      title: ads.title,
      author: author
    })
  }

  async delet(data: number): Promise<DeleteAdvertsementOutputDTO> {
    const ads = await this.loadAds(data)
    const result = await this.advertisementRepo.delete(ads)
    if (!result) throw new BadRequest()
    return new DeleteAdvertsementOutputDTO({ message: 'Delete success' })
  }

  async getDetail(data: number): Promise<GetDetailAdvertisementOutputDTO> {
    const response = await this.advertisementRepo.findById(data)
    if (!response) throw new NotFound('Không tìm thấy quảng cáo')
    return this.toDetailDto(response)
  }

  async getList(
    accountId?: number
  ): Promise<GetDetailAdvertisementOutputDTO[]> {
    const list = await this.advertisementRepo.findAll(accountId)
    return list.map((item) => this.toDetailDto(item))
  }

  async create(
    data: CreateAdvertsementInputDTO
  ): Promise<CreateAdvertsementOutputDTO> {
    const profile = await this.requireApprovedAdvertiser(data.accountId)

    const entity = new Advertisements({
      advertiser: profile,
      createdAt: new Date(),
      description: data.description,
      imageUrl: data.imageurl,
      linkReference: data.linkref,
      title: data.title
    })
    const response = await this.advertisementRepo.create(entity)
    if (!response) throw new BadRequest()

    return new CreateAdvertsementOutputDTO({
      id: response.id
    })
  }

  async update(
    data: UpdateAdvertsementInputDTO
  ): Promise<UpdateAdvertsementOutputDTO> {
    const ads = await this.loadAds(data.adsId)

    // Cố tình KHÔNG gán lại ads.advertiser: đổi chủ sở hữu không phải việc của
    // luồng update, code cũ cho phép việc này nên có thể chuyển ads sang người khác.
    ads.description = data.description
    ads.imageUrl = data.imageurl
    ads.linkReference = data.linkref
    ads.title = data.title
    ads.updatedAt = new Date()

    const response = await this.advertisementRepo.update(ads)
    if (!response) throw new BadRequest()
    return new UpdateAdvertsementOutputDTO({
      id: response.id
    })
  }
}
