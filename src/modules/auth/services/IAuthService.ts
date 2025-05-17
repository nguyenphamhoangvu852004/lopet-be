import { LoginInputDTO, LoginOutputDTO } from '~/modules/auth/dto/Login'
import { RegisterInputDTO, RegisterOutputDTO } from '~/modules/auth/dto/Register'
import { ResetPasswordInputDto, ResetPasswordOutputDto } from '~/modules/auth/dto/ResetPassword'

export default interface IAuthService {
  login(data: LoginInputDTO): Promise<LoginOutputDTO>
  register(data: RegisterInputDTO): Promise<RegisterOutputDTO>
  resetPassword(data: ResetPasswordInputDto): Promise<ResetPasswordOutputDto>
}
