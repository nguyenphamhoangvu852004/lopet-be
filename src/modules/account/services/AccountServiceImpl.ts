import { Accounts } from '~/entities/accounts.entity'
import { NotFound } from '~/error/error.custom'
import { CreateAccountDTO } from '~/modules/account/dto/Create'
import { GetAccountOutputDTO } from '~/modules/account/dto/Get'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { IAccountService } from '~/modules/account/services/IAccountService'

export class AccountServiceImpl implements IAccountService {
  constructor(private repo: IAccountRepo) {
    this.repo = repo
  }
  async getById(data: number): Promise<GetAccountOutputDTO> {
    try {
      const account = await this.repo.findById(data)
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
      throw new Error((error as Error).message)
    }
  }

  async getByEmail(data: string): Promise<GetAccountOutputDTO> {
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
      throw new Error((error as Error).message)
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
      throw new Error((error as Error).message)
    }
  }
}
