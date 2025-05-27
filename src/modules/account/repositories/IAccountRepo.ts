import { Accounts } from '~/entities/accounts.entity'

export default interface IAccountRepo {
  setRolesToAccount(userId: number, roles: string[]): Promise<Accounts>
  findById(id: number): Promise<Accounts | null>
  findByEmail(email: string): Promise<Accounts | null>
  findByUsername(data: string): Promise<Accounts | null>
  findAll(): Promise<Accounts[]>
  getSuggest(id: number, limit: number): Promise<Accounts[]>
  create(data: Accounts): Promise<Accounts>
  update(data: Accounts): Promise<Accounts | null>
  delete(data: Accounts): Promise<Accounts | null>
}
