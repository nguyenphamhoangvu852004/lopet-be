import {
  AdvertiserProfileOutputDTO,
  RegisterAdvertiserInputDTO,
  ReviewAdvertiserInputDTO
} from '~/modules/advertiser/dto/AdvertiserProfile'

export default interface IAdvertiserProfileService {
  register(
    data: RegisterAdvertiserInputDTO
  ): Promise<AdvertiserProfileOutputDTO>
  getMine(accountId: number): Promise<AdvertiserProfileOutputDTO>
  getList(): Promise<AdvertiserProfileOutputDTO[]>
  review(data: ReviewAdvertiserInputDTO): Promise<AdvertiserProfileOutputDTO>
}
