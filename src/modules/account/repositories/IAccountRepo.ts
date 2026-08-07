import { Accounts } from '~/entities/accounts.entity'

export default interface IAccountRepo {
  checkAccountExistByEmail(accountId: string): Promise<boolean>
  setRolesToAccount(
    userId: number,
    roles: string[],
    grantedBy?: number
  ): Promise<Accounts>
  findById(id: number): Promise<Accounts | null>
  findByEmail(email: string): Promise<Accounts | null>
  findByUsername(data: string): Promise<Accounts | null>

  /**
   * CHỈ dùng cho luồng xác thực (login, verify mật khẩu).
   *
   * Cột accounts.password khai báo `select: false` nên mọi query thường sẽ
   * KHÔNG load nó. Hai method dưới đây cố ý addSelect password, vì vậy tuyệt
   * đối không được gọi từ tầng đọc dữ liệu thông thường hay đổ thẳng vào DTO.
   */
  findByUsernameForAuth(username: string): Promise<Accounts | null>
  findByEmailForAuth(email: string): Promise<Accounts | null>
  findAll(): Promise<Accounts[]>
  getSuggest(id: number, limit: number): Promise<Accounts[]>
  create(data: Accounts): Promise<Accounts | null>
  update(data: Accounts): Promise<Accounts | null>
  delete(data: Accounts): Promise<Accounts | null>
}
