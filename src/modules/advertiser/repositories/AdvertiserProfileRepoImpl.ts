import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { AdvertiserProfiles } from '~/entities/advertiserProfiles.entity'
import IAdvertiserProfileRepo from '~/modules/advertiser/repositories/IAdvertiserProfileRepo'

export default class AdvertiserProfileRepoImpl
  implements IAdvertiserProfileRepo
{
  private repo: Repository<AdvertiserProfiles>
  constructor() {
    this.repo = mySqlDataSource.getRepository(AdvertiserProfiles)
  }

  async findById(id: number): Promise<AdvertiserProfiles | null> {
    return this.repo.findOne({
      where: { id },
      relations: { account: true }
    })
  }

  async findByAccountId(accountId: number): Promise<AdvertiserProfiles | null> {
    return this.repo.findOne({
      where: { account: { id: accountId } },
      relations: { account: true }
    })
  }

  async findAll(): Promise<AdvertiserProfiles[]> {
    return this.repo.find({
      relations: { account: true, approvedBy: true },
      order: { createdAt: 'DESC' }
    })
  }

  async create(data: AdvertiserProfiles): Promise<AdvertiserProfiles> {
    return this.repo.save(data)
  }

  async update(data: AdvertiserProfiles): Promise<AdvertiserProfiles> {
    return this.repo.save(data)
  }
}
