import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { logger } from '~/config/logger'
import { Accounts } from '~/entities/accounts.entity'
import { Profiles } from '~/entities/profiles.entity'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'

export default class AccountRepoImpl implements IAccountRepo {
  private accountsRepo: Repository<Accounts>
  private profileRepo: Repository<Profiles>
  constructor() {
    this.accountsRepo = mySqlDataSource.getRepository(Accounts)
    this.profileRepo = mySqlDataSource.getRepository(Profiles)
  }
  async findById(id: number): Promise<Accounts | null> {
    const account = await this.accountsRepo.findOne({
      where: { id: id },
      relations: {
        profile: true
      }
    })
    if (!account) {
      return null
    }
    console.log(account)
    return account
  }

  async findAll(): Promise<Accounts[]> {
    return this.accountsRepo.find({
      relations: {
        profile: true,
        sentFriendRequests: true,
        receivedFriendRequests: true
      }
    })
  }
  async create(data: Accounts): Promise<Accounts> {
    const createdEntity = await this.accountsRepo.save(data)
    return createdEntity
  }

  async update(data: Accounts): Promise<Accounts | null> {
    const updatedEntity = await this.accountsRepo.save(data)
    return updatedEntity
  }

  async findByEmail(email: string): Promise<Accounts | null> {
    const account = await this.accountsRepo.findOne({
      where: {
        email: email
      },
      relations: {
        profile: true
      }
    })
    logger.error('account', account)
    if (!account) {
      return null
    }
    return account
  }

  async findByUsername(data: string): Promise<Accounts | null> {
    const account = this.accountsRepo.findOne({
      where: {
        username: data
      },
      relations: {
        profile: true
      }
    })
    if (!account) return null
    return account
  }

  async delete(data: Accounts): Promise<Accounts | null> {
    const deletedEntity = await this.accountsRepo.remove(data)
    if (!deletedEntity) {
      return null
    }
    return deletedEntity
  }
}
