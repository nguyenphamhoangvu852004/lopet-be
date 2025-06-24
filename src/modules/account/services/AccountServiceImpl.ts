/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { handleThrowError } from '~/utils/handle.util'

export class AccountServiceImpl implements IAccountService {
  constructor(private repo: IAccountRepo) {
    this.repo = repo
  }
  async setRolesToAccount(userId: string, roles: string[]): Promise<Accounts> {
    try {
      const account = await this.repo.setRolesToAccount(Number(userId), roles)
      return account
    } catch (error: Error | any) {
      throw new Error(error.message)
    }
  }
  async getSuggest(id: number, limit: number): Promise<Accounts[]> {
    try {
      const accounts = await this.repo.getSuggest(id, limit)
      return accounts
    } catch (error) {
      handleThrowError(error)
    }
  }
  async getById(data: number): Promise<GetAccountOutputDTO> {
    try {
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
    } catch (error) {
      handleThrowError(error)
    }
  }

  async getList(): Promise<Accounts[]> {
    try {
      const response = await this.repo.findAll();

      const list: Accounts[] = [];

      for (const account of response) {
        const isAdmin = account.roles.some(role => role.name === ROLENAME.ADMIN);
        if (!isAdmin) {
          list.push(account);
        }
      }

      return list;

    } catch (error) {
      handleThrowError(error);
    }
  }
  async getByEmail(data: string): Promise<GetAccountOutputDTO> {
    try {
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
    } catch (error) {
      handleThrowError(error)
    }
  }

  async getByUsername(data: string): Promise<GetAccountOutputDTO> {
    try {
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
    } catch (error) {
      handleThrowError(error)
    }
  }

  async createAccount(data: CreateAccountDTO): Promise<GetAccountOutputDTO> {
    try {
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
    } catch (error) {
      handleThrowError(error)
    }
  }

  async setProfile(accountId: number, profile: CreateProfileOutputDTO): Promise<GetAccountOutputDTO> {
    try {
      // tìm kiếm caí account trong database
      const account: Accounts | null = await this.repo.findById(accountId)
      if (!account) throw new BadRequest()
      if (!account.profile) {
        throw new BadRequest('Account profile is null')
      }
      const profile = new Profiles({
        id: account.profile.id,
        fullName: account.profile.fullName,
        bio: account.profile.bio,
        phoneNumber: account.profile.phoneNumber,
        avatarUrl: account.profile.avatarUrl,
        coverUrl: account.profile.coverUrl
      })
      account.profile = profile
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
    } catch (error) {
      handleThrowError(error)
    }
  }

  async banId(id: number): Promise<BanIdOutputDTO> {
    try {
      const account = await this.repo.findById(id)
      if (!account) throw new BadRequest()
      account.isBanned = 1
      const response = await this.repo.update(account)
      if (!response) throw new BadRequest()
      return new BanIdOutputDTO({
        id: response.id
      })
    } catch (error) {
      handleThrowError(error)
    }
  }

  async unbanId(id: number): Promise<BanIdOutputDTO> {
    try {
      const account = await this.repo.findById(id)
      if (!account) throw new BadRequest()
      account.isBanned = 0
      const response = await this.repo.update(account)
      if (!response) throw new BadRequest()
      return new BanIdOutputDTO({
        id: response.id
      })
    } catch (error) {
      handleThrowError(error)
    }
  }

  async delete(id: number): Promise<DeleteAccountOutputDTO> {
    try {
      const account = await this.repo.findById(id)
      if (!account) throw new BadRequest()
      const response = await this.repo.delete(account)
      if (!response) throw new BadRequest()
      return new DeleteAccountOutputDTO({
        id: response.id
      })
    } catch (error) {
      handleThrowError(error)
    }
  }
}
