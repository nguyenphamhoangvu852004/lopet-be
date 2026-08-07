import { FindOptionsWhere, Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Advertisements } from '~/entities/advertisements.entity'
import { IAdvertisementRepositories } from '~/modules/advertisement/repositories/IAdvertisementRepositories'

/** Quảng cáo luôn phải nạp kèm advertiser + account để dựng Author trong DTO */
const ADS_RELATIONS = { advertiser: { account: true } } as const

export class AdvertisementRepositoriesImpl
  implements IAdvertisementRepositories
{
  private advertisementRepo: Repository<Advertisements>
  constructor() {
    this.advertisementRepo = mySqlDataSource.getRepository(Advertisements)
  }

  async update(data: Advertisements): Promise<Advertisements | null> {
    const response = await this.advertisementRepo.save(data)
    if (!response) return null
    return response
  }

  async delete(data: Advertisements): Promise<Advertisements | null> {
    const response = await this.advertisementRepo.remove(data)
    if (!response) return null
    return response
  }

  async findById(id: number): Promise<Advertisements | null> {
    const response = await this.advertisementRepo.findOne({
      where: { id: id },
      relations: ADS_RELATIONS
    })
    if (!response) return null
    return response
  }

  async create(data: Advertisements): Promise<Advertisements | null> {
    const response = await this.advertisementRepo.save(data)
    if (!response) return null
    return response
  }

  async findAll(accountId?: number): Promise<Advertisements[]> {
    const whereClause: FindOptionsWhere<Advertisements> = {}

    if (accountId) {
      whereClause.advertiser = { account: { id: accountId } }
    }
    return await this.advertisementRepo.find({
      where: whereClause,
      relations: ADS_RELATIONS
    })
  }
}
