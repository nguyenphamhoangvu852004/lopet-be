import { Accounts } from '~/entities/accounts.entity'

export default interface IAccountRepo {
  findById(id: number): Promise<Accounts | null>
  findByEmail(email: string): Promise<Accounts | null>
  findByUsername(data: string): Promise<Accounts | null>
  create(data: Accounts): Promise<Accounts>
  update(data: Accounts): Promise<Accounts | null>
  delete(data: Accounts): Promise<Accounts | null>
}
