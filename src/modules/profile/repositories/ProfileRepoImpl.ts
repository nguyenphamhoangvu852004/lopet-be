import { Repository } from 'typeorm'
import { appDataSource } from '~/config/appDataSource'
import { logger } from '~/config/logger'
import { Accounts } from '~/entities/accounts.entity'
import { Profiles } from '~/entities/profiles.entity'
import IProfileRepo from '~/modules/profile/repositories/IProfileRepo'

export default class ProfileRepoImpl implements IProfileRepo {
  private profileRepo: Repository<Profiles>
  private accountRepo: Repository<Accounts>
  constructor() {
    this.profileRepo = appDataSource.getRepository(Profiles)
    this.accountRepo = appDataSource.getRepository(Accounts)
  }
  async findById(id: number): Promise<Profiles | null> {
    try {
      const profile: Profiles | null = await this.profileRepo.findOneBy({ id })
      if (!profile) {
        return null
      }
      return profile
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async create(data: Profiles): Promise<Profiles | null> {
    try {
      const createdEntity = await this.profileRepo.save(data)
      if (!createdEntity) {
        return null
      }
      return createdEntity
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async update(id: number, data: Profiles): Promise<Profiles | null> {
    try {
      const updateResult = await this.profileRepo.update(id, data)
      if (updateResult.affected === 0) {
        return null
      }
      const updatedEntity = await this.profileRepo.findOneBy({ id })
      return updatedEntity
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async findByAccountId(id: number): Promise<Profiles | null> {
    try {
      const profile: Profiles | null = await this.profileRepo.findOne({
        where: {
          account: {
            id: id
          }
        }
      })
      if (!profile) {
        return null
      }
      return profile
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async setToAccount(acountId: number, profile: Profiles): Promise<Profiles | null> {
    const account = await this.accountRepo.findOneBy({ id: acountId })
    if (!account) {
      return null
    }
    account.profile = profile
    const updatedEntity = await this.accountRepo.save(account)
    if (!updatedEntity) {
      return null
    }
    return profile
  }
}
