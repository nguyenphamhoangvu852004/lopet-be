/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { logger } from '~/config/logger'
import { Accounts } from '~/entities/accounts.entity'
import { FriendShips } from '~/entities/friendShips.entity'
import { Profiles } from '~/entities/profiles.entity'
import { ROLENAME, Roles } from '~/entities/roles.entity'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'

export default class AccountRepoImpl implements IAccountRepo {
  private accountsRepo: Repository<Accounts>
  private profileRepo: Repository<Profiles>
  private friendShipRepo: Repository<FriendShips>
  private roleRepo: Repository<Roles>
  constructor() {
    this.accountsRepo = mySqlDataSource.getRepository(Accounts)
    this.profileRepo = mySqlDataSource.getRepository(Profiles)
    this.friendShipRepo = mySqlDataSource.getRepository(FriendShips)
    this.roleRepo = mySqlDataSource.getRepository(Roles)
  }
  async checkAccountExistByEmail(email: string): Promise<boolean> {
    const account = await this.accountsRepo.findOneBy({ email: email })
    if (account) {
      return true
    }
    return false
  }
  async setRolesToAccount(userId: number, roles: string[]): Promise<Accounts> {
    try {
      const account = await this.accountsRepo.findOneBy({ id: userId })
      if (!account) {
        throw new Error('Account not found')
      }
      const listRole: Roles[] = []
      for (const item of roles) {
        const role = await this.roleRepo.findOneBy({ name: item as ROLENAME })
        if (!role) {
          throw new Error('Role not found')
        }
        listRole.push(role)
      }
      account.roles = listRole
      await this.accountsRepo.save(account)
      return account
    } catch (error: Error | any) {
      throw new Error(error.message)
    }
  }
  async findById(id: number): Promise<Accounts | null> {
    const account = await this.accountsRepo.findOne({
      where: { id: id },
      relations: {
        profile: true,
        roles: true
      }
    })
    if (!account) {
      return null
    }
    return account
  }

  async findAll(): Promise<Accounts[]> {
    return this.accountsRepo.find({
      relations: {
        profile: true,
        sentFriendRequests: true,
        receivedFriendRequests: true,
        roles: true
      }
    })
  }
  async create(data: Accounts): Promise<Accounts | null> {
    const createdEntity = await this.accountsRepo.save(data)
    if (!createdEntity) {
      return null
    }
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
        profile: true,
        roles: true
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
        profile: true,
        roles: true
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

  async getSuggest(currentAccountId: number, limit: number): Promise<Accounts[]> {
    // Lấy cái account ra
    const accounts = await this.accountsRepo.findOne({
      where: { id: currentAccountId },
      relations: {
        profile: true,
        roles: true
      }
    })

    if (!accounts) {
      return []
    }

    // Tìm tất cả các mối quan hệ friendship (bất kể status gì)
    // mà currentAccount có liên quan (là sender hoặc receiver)
    const friendShips = await this.friendShipRepo.find({
      where: [{ sender: { id: currentAccountId } }, { receiver: { id: currentAccountId } }]
    })

    // Lấy danh sách ID của những người đã có quan hệ
    const excludeIds: number[] = []
    friendShips.forEach((friendship) => {
      if (friendship.sender.id === currentAccountId) {
        excludeIds.push(friendship.receiver.id)
      } else {
        excludeIds.push(friendship.sender.id)
      }
    })

    // Thêm chính currentAccountId vào danh sách loại bỏ
    excludeIds.push(currentAccountId)

    // Tìm những account không nằm trong danh sách excludeIds
    const suggestedAccounts = await this.accountsRepo
      .createQueryBuilder('account')
      .where('account.id NOT IN (:...excludeIds)', {
        excludeIds: excludeIds.length > 0 ? excludeIds : [0] // Tránh lỗi empty array
      })
      .andWhere('account.isBanned = 0') // Loại bỏ account bị ban
      .limit(limit)
      .orderBy('RAND()')
      .getMany()

    return suggestedAccounts
  }
}
