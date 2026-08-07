import { AdvertiserProfiles } from '~/entities/advertiserProfiles.entity'

export default interface IAdvertiserProfileRepo {
  findById(id: number): Promise<AdvertiserProfiles | null>
  findByAccountId(accountId: number): Promise<AdvertiserProfiles | null>
  findAll(): Promise<AdvertiserProfiles[]>
  create(data: AdvertiserProfiles): Promise<AdvertiserProfiles>
  update(data: AdvertiserProfiles): Promise<AdvertiserProfiles>
}
