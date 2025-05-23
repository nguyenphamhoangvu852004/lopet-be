import { Accounts } from '~/entities/accounts.entity'
import { BanIdOutputDTO } from '~/modules/account/dto/ban'
import { CreateAccountDTO } from '~/modules/account/dto/Create'
import { DeleteAccountOutputDTO } from '~/modules/account/dto/Detele'
import { GetAccountOutputDTO } from '~/modules/account/dto/Get'
import { CreateProfileOutputDTO } from '~/modules/profile/dto/Create'

export interface IAccountService {
  getById(data: number): Promise<GetAccountOutputDTO>
  getByEmail(data: string): Promise<GetAccountOutputDTO>
  getByUsername(data: string): Promise<GetAccountOutputDTO>
  getSuggest(id: number): Promise<Accounts[]>
  getList(): Promise<Accounts[]>
  createAccount(data: CreateAccountDTO): Promise<GetAccountOutputDTO>
  setProfile(accountId: number, profile: CreateProfileOutputDTO): Promise<GetAccountOutputDTO>
  banId(id: number): Promise<BanIdOutputDTO>
  unbanId(id: number): Promise<BanIdOutputDTO>
  delete(id: number): Promise<DeleteAccountOutputDTO>
}
