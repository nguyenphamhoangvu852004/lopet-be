import { Accounts } from '~/entities/accounts.entity'
import { Profiles } from '~/entities/profiles.entity'
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
  async getById(data: number): Promise<GetAccountOutputDTO> {
    try {
      const account = await this.repo.findById(data)
      if (!account) throw new NotFound()
      const dto = new GetAccountOutputDTO({
        id: account.id,
        email: account.email,
        username: account.username,
        password: account.password
      })
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

  async getByEmail(data: string): Promise<GetAccountOutputDTO> {
    try {
      const account = await this.repo.findByEmail(data)
      if (!account) throw new NotFound()
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

  async getByUsername(data: string): Promise<GetAccountOutputDTO> {
    try {
      const account = await this.repo.findByUsername(data)
      if (!account) throw new Error('Not found')
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
      const account = await this.repo.findById(accountId)
      if (!account) throw new BadRequest()
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
