import { Repository } from 'typeorm'
import { appDataSource } from '~/config/appDataSource'
import { logger } from '~/config/logger'
import { Accounts } from '~/entities/accounts.entity'
import { Profiles } from '~/entities/profiles.entity'
import { CreateAccountDTO } from '~/modules/account/dto/Create'
import { UpdateAccountDTO } from '~/modules/account/dto/Update'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'

export default class AccountRepoImpl implements IAccountRepo {
  private accountsRepo: Repository<Accounts>
  private profileRepo: Repository<Profiles>
  constructor() {
    this.accountsRepo = appDataSource.getRepository(Accounts)
    this.profileRepo = appDataSource.getRepository(Profiles)
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

  async create(data: CreateAccountDTO): Promise<Accounts> {
    const createdEntity = await this.accountsRepo.save(data)
    return createdEntity
  }

  async update(data: UpdateAccountDTO): Promise<Accounts | null> {
    const account = await this.accountsRepo.findOneBy({ id: data.id })
    if (!account) {
      return null
    }
    const updatedEntity = await this.accountsRepo.save(account)
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
}
