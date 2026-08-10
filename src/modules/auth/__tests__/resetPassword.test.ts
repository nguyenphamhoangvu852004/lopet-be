/**
 * Chốt chặn hồi quy cho lỗ hổng chiếm tài khoản qua POST /v1/auth/reset.
 *
 * Trước khi vá, resetPassword() ghi thẳng mật khẩu mới chỉ dựa trên email do
 * client gửi lên — không đòi bất kỳ bằng chứng nào rằng người gọi kiểm soát
 * hòm thư đó. Bài test dưới đây khoá lại đúng ba tính chất bảo mật của bản vá.
 */

// redis là singleton mức module trong appDataSource nên phải mock cả file.
// mySqlDataSource cũng được mock để import không cần DataSource đã initialize.
jest.mock('~/config/appDataSource', () => ({
  redis: { getDel: jest.fn() },
  mySqlDataSource: { getRepository: jest.fn() }
}))

import { redis } from '~/config/appDataSource'
import { Accounts } from '~/entities/accounts.entity'
import { Forbidden } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { ResetPasswordInputDto } from '~/modules/auth/dto/ResetPassword'
import AuthServiceImpl from '~/modules/auth/services/AuthServiceImpl'
import { comparePassword } from '~/utils/bcryptjs.util'

const getDelMock = redis.getDel as unknown as jest.Mock

const VICTIM_EMAIL = 'victim@example.com'
const OLD_PASSWORD_HASH = 'hash-mat-khau-cu'

/** Repo giả: chỉ hiện thực đúng hai method mà resetPassword dùng tới */
function makeAccountRepo() {
  const account = new Accounts({
    id: 1,
    email: VICTIM_EMAIL,
    username: 'victim',
    password: OLD_PASSWORD_HASH
  })

  const repo = {
    findByEmail: jest.fn(async (email: string) =>
      email === VICTIM_EMAIL ? account : null
    ),
    update: jest.fn(async (data: Accounts) => data)
  } as unknown as IAccountRepo

  return { repo, account }
}

function input(password = 'MatKhauMoi@2026') {
  return new ResetPasswordInputDto({
    email: VICTIM_EMAIL,
    password,
    confirmPassword: password
  })
}

describe('AuthServiceImpl.resetPassword', () => {
  beforeEach(() => jest.clearAllMocks())

  it('từ chối khi chưa xác thực OTP và KHÔNG đụng vào mật khẩu', async () => {
    // Chưa qua luồng OTP -> Redis không có cờ email_verified
    getDelMock.mockResolvedValue(null)
    const { repo, account } = makeAccountRepo()
    const service = new AuthServiceImpl(repo)

    await expect(service.resetPassword(input())).rejects.toBeInstanceOf(Forbidden)

    // Tính chất quan trọng nhất: mật khẩu cũ còn nguyên, không có lệnh ghi nào
    expect(account.password).toBe(OLD_PASSWORD_HASH)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('cho phép đổi mật khẩu khi đã có cờ xác thực OTP', async () => {
    getDelMock.mockResolvedValue('true')
    const { repo, account } = makeAccountRepo()
    const service = new AuthServiceImpl(repo)

    const result = await service.resetPassword(input('MatKhauMoi@2026'))

    expect(result.email).toBe(VICTIM_EMAIL)
    expect(repo.update).toHaveBeenCalledTimes(1)
    expect(account.password).not.toBe(OLD_PASSWORD_HASH)
    // Mật khẩu phải được băm, không lưu plaintext
    expect(account.password).not.toBe('MatKhauMoi@2026')
    await expect(
      comparePassword('MatKhauMoi@2026', account.password)
    ).resolves.toBe(true)
  })

  it('tiêu thụ cờ xác thực bằng getDel — một lần OTP chỉ đổi được một lần', async () => {
    getDelMock.mockResolvedValue('true')
    const { repo } = makeAccountRepo()
    const service = new AuthServiceImpl(repo)

    await service.resetPassword(input())

    // getDel là lệnh nguyên tử đọc-và-xoá; dùng get() rồi del() riêng sẽ để hở
    // cửa sổ cho hai request song song cùng đi qua.
    expect(getDelMock).toHaveBeenCalledTimes(1)
    expect(getDelMock).toHaveBeenCalledWith(`email_verified:${VICTIM_EMAIL}`)
  })

  it('không đổi mật khẩu khi confirmPassword không khớp', async () => {
    getDelMock.mockResolvedValue('true')
    const { repo, account } = makeAccountRepo()
    const service = new AuthServiceImpl(repo)

    const dto = new ResetPasswordInputDto({
      email: VICTIM_EMAIL,
      password: 'MatKhauMoi@2026',
      confirmPassword: 'GoNhamRoi@2026'
    })

    await expect(service.resetPassword(dto)).rejects.toThrow()
    expect(account.password).toBe(OLD_PASSWORD_HASH)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
