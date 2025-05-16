import { LoginInputDTO, LoginOutputDTO } from '~/modules/auth/dto/Login'
import { RegisterInputDTO, RegisterOutputDTO } from '~/modules/auth/dto/Register'

export default interface IAuthService {
  login(data: LoginInputDTO): Promise<LoginOutputDTO>
  register(data: RegisterInputDTO): Promise<RegisterOutputDTO>
}
