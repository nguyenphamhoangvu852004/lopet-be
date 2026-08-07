/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { logger } from '~/config/logger'
import { AccountRoles } from '~/entities/accountRoles.entity'
import { Accounts } from '~/entities/accounts.entity'
import { FriendShips } from '~/entities/friendShips.entity'
import { Profiles } from '~/entities/profiles.entity'
import { ROLENAME, Roles } from '~/entities/roles.entity'
import { NotFound } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'

/** Quan hệ chuẩn để lấy kèm role của tài khoản */
const ROLE_RELATIONS = { accountRoles: { role: true } } as const

export default class AccountRepoImpl implements IAccountRepo {
  private accountsRepo: Repository<Accounts>
  private profileRepo: Repository<Profiles>
  private friendShipRepo: Repository<FriendShips>
  private roleRepo: Repository<Roles>
  private accountRoleRepo: Repository<AccountRoles>
  constructor() {
    this.accountsRepo = mySqlDataSource.getRepository(Accounts)
    this.profileRepo = mySqlDataSource.getRepository(Profiles)
    this.friendShipRepo = mySqlDataSource.getRepository(FriendShips)
    this.roleRepo = mySqlDataSource.getRepository(Roles)
    this.accountRoleRepo = mySqlDataSource.getRepository(AccountRoles)
  }

  /**
   * CHỈ dùng cho luồng đăng nhập.
   * addSelect('account.password') là cố ý — password bị `select: false` ở entity.
   */
  async findByUsernameForAuth(username: string): Promise<Accounts | null> {
    return this.accountsRepo
      .createQueryBuilder('account')
      .addSelect('account.password')
      .leftJoinAndSelect('account.accountRoles', 'accountRole')
      .leftJoinAndSelect('accountRole.role', 'role')
      .where('account.username = :username', { username })
      .getOne()
  }

  /**
   * CHỈ dùng cho luồng xác thực mật khẩu bằng email (verifyAccount).
   * Xem ghi chú ở findByUsernameForAuth.
   */
  async findByEmailForAuth(email: string): Promise<Accounts | null> {
    return this.accountsRepo
      .createQueryBuilder('account')
      .addSelect('account.password')
      .leftJoinAndSelect('account.accountRoles', 'accountRole')
      .leftJoinAndSelect('accountRole.role', 'role')
      .where('account.email = :email', { email })
      .getOne()
  }
  async checkAccountExistByEmail(email: string): Promise<boolean> {
    const account = await this.accountsRepo.findOneBy({ email: email })
    if (account) {
      return true
    }
    return false
  }
  async setRolesToAccount(
    userId: number,
    roles: string[],
    grantedBy?: number
  ): Promise<Accounts> {
    const account = await this.accountsRepo.findOneBy({ id: userId })
    if (!account) {
      throw new NotFound('Account not found')
    }
    const listRole: Roles[] = []
    for (const item of roles) {
      const role = await this.roleRepo.findOneBy({ name: item as ROLENAME })
      if (!role) {
        throw new NotFound(`Role ${item} not found`)
      }
      listRole.push(role)
    }

    // account_role giờ là entity tường minh nên phải ghi qua repo riêng.
    // Giữ nguyên ngữ nghĩa "set": thu hồi hết role cũ rồi cấp lại danh sách mới.
    await this.accountRoleRepo.delete({ accountId: userId })
    await this.accountRoleRepo.save(
      listRole.map(
        (role) =>
          new AccountRoles({
            accountId: userId,
            roleId: role.id,
            grantedBy: grantedBy ? ({ id: grantedBy } as Accounts) : null,
            grantedAt: new Date()
          })
      )
    )

    const updated = await this.findById(userId)
    return updated ?? account
  }
  async findById(id: number): Promise<Accounts | null> {
    const account = await this.accountsRepo.findOne({
      where: { id: id },
      relations: {
        profile: true,
        ...ROLE_RELATIONS
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
        ...ROLE_RELATIONS
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
        ...ROLE_RELATIONS
      }
    })
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
        ...ROLE_RELATIONS
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

  async getSuggest(
    currentAccountId: number,
    limit: number
  ): Promise<Accounts[]> {
    // Lấy cái account ra
    const accounts = await this.accountsRepo.findOne({
      where: { id: currentAccountId },
      relations: {
        profile: true,
        ...ROLE_RELATIONS
      }
    })

    if (!accounts) {
      return []
    }

    // Tìm tất cả các mối quan hệ friendship (bất kể status gì)
    // mà currentAccount có liên quan (là sender hoặc receiver)
    const friendShips = await this.friendShipRepo.find({
      where: [
        { sender: { id: currentAccountId } },
        { receiver: { id: currentAccountId } }
      ]
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
