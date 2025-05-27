/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Advertisements } from '~/entities/advertisements.entity'
import { IAdvertisementRepositories } from '~/modules/advertisement/repositories/IAdvertisementRepositories'

export class AdvertisementRepositoriesImpl implements IAdvertisementRepositories {
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
      relations: { account: true }
    })
    if (!response) return null
    return response
  }
  async create(data: Advertisements): Promise<Advertisements | null> {
    const response = await this.advertisementRepo.save(data)
    if (!response) return null
    return response
  }

  async findAll(accountId): Promise<Advertisements[]> {
    const whereClause: any = {}

    if (accountId) {
      whereClause.account = { id: accountId }
    }
    return await this.advertisementRepo.find({
      where: whereClause,
      relations: { account: true }
    })
  }
}
