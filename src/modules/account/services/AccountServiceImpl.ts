import { Accounts } from '~/entities/accounts.entity'
import { Profiles } from '~/entities/profiles.entity'
import { ROLENAME } from '~/entities/roles.entity'
import { BadRequest, NotFound } from '~/error/error.custom'
import { BanIdOutputDTO } from '~/modules/account/dto/ban'
import { CreateAccountDTO } from '~/modules/account/dto/Create'
import { DeleteAccountOutputDTO } from '~/modules/account/dto/Detele'
import { GetAccountOutputDTO } from '~/modules/account/dto/Get'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { IAccountService } from '~/modules/account/services/IAccountService'
import { CreateProfileOutputDTO } from '~/modules/profile/dto/Create'
import { GetProfileOutputDTO } from '~/modules/profile/dto/Get'

export class AccountServiceImpl implements IAccountService {
  constructor(private repo: IAccountRepo) {
    this.repo = repo
  }
  async setRolesToAccount(userId: string, roles: string[]): Promise<Accounts> {
    const account = await this.repo.setRolesToAccount(Number(userId), roles)
    return account
  }
  async getSuggest(id: number, limit: number): Promise<Accounts[]> {
    const accounts = await this.repo.getSuggest(id, limit)
    return accounts
  }
  async getById(data: number): Promise<GetAccountOutputDTO> {
    const account = await this.repo.findById(data)
    if (!account) throw new NotFound()
    const dto = new GetAccountOutputDTO({
      id: account.id,
      email: account.email,
      username: account.username,
      password: account.password,
      roles: []
    })
    for (const role of account.roles) dto.roles.push(role.name)
    if (!account.profile) {
      return dto
    }

    const profileDto = new GetProfileOutputDTO({
      id: account.profile.id,
      fullName: account.profile.fullName,
      bio: account.profile.bio,
      phoneNumber: account.profile.phoneNumber,
      avatarUrl: account.profile.avatarUrl,
      coverUrl: account.profile.coverUrl
    })
    dto.profile = profileDto
    return dto
  }

  async getList(): Promise<Accounts[]> {
    const response = await this.repo.findAll()

    const list: Accounts[] = []

    for (const account of response) {
      const isAdmin = account.roles.some((role) => role.name === ROLENAME.ADMIN)
      if (!isAdmin) {
        list.push(account)
      }
    }

    return list
  }
  async getByEmail(data: string): Promise<GetAccountOutputDTO> {
    const account = await this.repo.findByEmail(data)
    if (!account) throw new NotFound()
    const dto = new GetAccountOutputDTO({
      id: account.id,
      email: account.email,
      username: account.username,
      password: account.password,
      profile: account.profile || null
    })
    return dto
  }

  async getByUsername(data: string): Promise<GetAccountOutputDTO> {
    const account = await this.repo.findByUsername(data)
    if (!account) throw new NotFound('Not found')
    const dto = new GetAccountOutputDTO({
      id: account.id,
      email: account.email,
      username: account.username,
      password: account.password,
      profile: account.profile
    })
    return dto
  }

  async createAccount(data: CreateAccountDTO): Promise<GetAccountOutputDTO> {
    const account = await this.repo.create(
      new Accounts({
        email: data.email,
        username: data.username,
        password: data.password,
        createdAt: new Date()
      })
    )
    if (!account) throw new BadRequest()
    const dto = new GetAccountOutputDTO({
      id: account.id,
      email: account.email,
      username: account.username,
      password: account.password,
      profile: account.profile
    })
    return dto
  }

  async setProfile(
    accountId: number,
    profile: CreateProfileOutputDTO
  ): Promise<GetAccountOutputDTO> {
    // tìm kiếm caí account trong database
    const account: Accounts | null = await this.repo.findById(accountId)
    if (!account) throw new BadRequest()
    if (!account.profile) {
      throw new BadRequest('Account profile is null')
    }
    const profileEntity = new Profiles({
      id: account.profile.id,
      fullName: account.profile.fullName,
      bio: account.profile.bio,
      phoneNumber: account.profile.phoneNumber,
      avatarUrl: account.profile.avatarUrl,
      coverUrl: account.profile.coverUrl
    })
    account.profile = profileEntity
    const enitty = await this.repo.update(account)
    if (!enitty) throw new BadRequest()
    const dto = new GetAccountOutputDTO({
      id: enitty.id,
      email: enitty.email,
      username: enitty.username,
      password: enitty.password,
      profile: enitty.profile
    })
    return dto
  }

  async banId(id: number): Promise<BanIdOutputDTO> {
    const account = await this.repo.findById(id)
    if (!account) throw new BadRequest()
    account.isBanned = 1
    const response = await this.repo.update(account)
    if (!response) throw new BadRequest()
    return new BanIdOutputDTO({
      id: response.id
    })
  }

  async unbanId(id: number): Promise<BanIdOutputDTO> {
    const account = await this.repo.findById(id)
    if (!account) throw new BadRequest()
    account.isBanned = 0
    const response = await this.repo.update(account)
    if (!response) throw new BadRequest()
    return new BanIdOutputDTO({
      id: response.id
    })
  }

  async delete(id: number): Promise<DeleteAccountOutputDTO> {
    const account = await this.repo.findById(id)
    if (!account) throw new BadRequest()
    const response = await this.repo.delete(account)
    if (!response) throw new BadRequest()
    return new DeleteAccountOutputDTO({
      id: response.id
    })
  }
}
