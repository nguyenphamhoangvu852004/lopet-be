import { log } from 'console'
import { Accounts } from '~/entities/accounts.entity'
import { BadRequest, Conflict, NotFound } from '~/error/error.custom'
import { GetAccountOutputDTO } from '~/modules/account/dto/Get'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { LoginInputDTO, LoginOutputDTO } from '~/modules/auth/dto/Login'
import { RegisterInputDTO, RegisterOutputDTO } from '~/modules/auth/dto/Register'
import { ResetPasswordInputDto, ResetPasswordOutputDto } from '~/modules/auth/dto/ResetPassword'
import IAuthService from '~/modules/auth/services/IAuthService'
import { comparePassword, hashPassword } from '~/utils/bcryptjs.util'
import { handleThrowError } from '~/utils/handle.util'
import { generateAccessToken, generateRefreshToken } from '~/utils/jwt.util'

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
        const payload = {
          id: account.id,
          email: account.email
        }
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
      log(data)
      const account = await this.accountRepo.findByEmail(data.email)
      log(account)
      if (account) throw new Conflict()
      if (data.password !== data.confirmPassword) throw new BadRequest()
      const hashedPassword = await hashPassword(data.password)
      const response: GetAccountOutputDTO = await this.accountRepo.create(
        new Accounts({
          email: data.email,
          username: data.username,
          password: hashedPassword
        })
      )
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
      const account = await this.accountRepo.findByEmail(data.email)
      if (!account) throw new NotFound()
      if (data.password !== data.confirmPassword) throw new BadRequest()
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
}
