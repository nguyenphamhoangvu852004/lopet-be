import { redis } from '~/config/appDataSource'
import { Accounts } from '~/entities/accounts.entity'
import { BadRequest, Conflict, NotFound } from '~/error/error.custom'
import { GetAccountOutputDTO } from '~/modules/account/dto/Get'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { VerifyAccountInputDTO, VerifyAccountOutputDTO } from '~/modules/auth/dto/ForgotPassword'
import { LoginInputDTO, LoginOutputDTO } from '~/modules/auth/dto/Login'
import { RegisterInputDTO, RegisterOutputDTO } from '~/modules/auth/dto/Register'
import { ResetPasswordInputDto, ResetPasswordOutputDto } from '~/modules/auth/dto/ResetPassword'
import IAuthService from '~/modules/auth/services/IAuthService'
import { comparePassword, hashPassword } from '~/utils/bcryptjs.util'
import { handleThrowError } from '~/utils/handle.util'
import { generateAccessToken, generateRefreshToken, UserPayload } from '~/utils/jwt.util'

export default class AuthServiceImpl implements IAuthService {
  constructor(private accountRepo: IAccountRepo) {
    this.accountRepo = accountRepo
  }
  async login(data: LoginInputDTO): Promise<LoginOutputDTO> {
    try {
      //tìm tài khoản coi nó có tồn tại hay chưa
      // tạo payload trả về cho người ta
      const account = await this.accountRepo.findByUsername(data.username)
      // có tài khoản thì nó so sanhs passsword
      if (!account) throw new NotFound()
      if (!(await comparePassword(data.password, account.password))) {
        throw new BadRequest()
      } else {
        // tạo token ở đây để trả về
        const payload: UserPayload = {
          id: account.id,
          email: account.email,
          roles: account.roles.map((role) => role.name)
        }
        console.log(payload)
        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)
        const result = new LoginOutputDTO({
          id: account.id,
          accessToken: accessToken,
          refreshToken: refreshToken
        })
        return result
      }
    } catch (error) {
      handleThrowError(error)
    }
  }
  async register(data: RegisterInputDTO): Promise<RegisterOutputDTO> {
    try {
      const isVerified = await redis.get(`email_verified:${data.email}`)
      if (!isVerified) {
        throw new BadRequest('Bạn cần xác thực OTP trước khi đăng ký.')
      }
      await redis.del(`email_verified:${data.email}`)
      const account = await this.accountRepo.findByEmail(data.email)
      if (account) throw new Conflict()
      if (data.password !== data.confirmPassword) throw new BadRequest()
      const hashedPassword = await hashPassword(data.password)
      const response: GetAccountOutputDTO | null = await this.accountRepo.create(
        new Accounts({
          email: data.email,
          username: data.username,
          password: hashedPassword
        })
      )
      if (!response) throw new BadRequest()
      return new RegisterOutputDTO({
        id: response.id,
        email: response.email,
        username: response.username
      })
    } catch (error) {
      handleThrowError(error)
    }
  }

  async resetPassword(data: ResetPasswordInputDto): Promise<ResetPasswordOutputDto> {
    try {
      // Validate: password & confirm
      if (data.password !== data.confirmPassword) {
        throw new BadRequest('Mật khẩu xác nhận không khớp')
      }

      const account = await this.accountRepo.findByEmail(data.email)
      if (!account) throw new NotFound()

      const hashedPassword = await hashPassword(data.password)
      account.password = hashedPassword

      const response = await this.accountRepo.update(account)
      if (!response) throw new BadRequest()

      return new ResetPasswordOutputDto({
        id: response.id,
        email: response.email,
        username: response.username
      })
    } catch (error) {
      handleThrowError(error)
    }
  }

  async verifyAccount(data: VerifyAccountInputDTO): Promise<VerifyAccountOutputDTO> {
    try {
      const account = await this.accountRepo.findByEmail(data.email)
      if (!account) throw new NotFound()
      if (!(await comparePassword(data.password, account.password))) throw new BadRequest()
      return new VerifyAccountOutputDTO({ isValid: true })
    } catch (error) {
      handleThrowError(error)
    }
  }
}
