import { CreateAccountDTO } from '~/modules/account/dto/Create'
import { GetAccountOutputDTO } from '~/modules/account/dto/Get'

export interface IAccountService {
  getById(data: number): Promise<GetAccountOutputDTO>
  getByEmail(data: string): Promise<GetAccountOutputDTO>
  getByUsername(data: string): Promise<GetAccountOutputDTO>
  createAccount(data: CreateAccountDTO): Promise<GetAccountOutputDTO>
}
