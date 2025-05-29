import { Request, Response } from 'express'
import { httpStatusCode, httpStatusMessage } from '~/global/httpStatusCode'
import { VerifyAccountInputDTO } from '~/modules/auth/dto/ForgotPassword'
import { LoginInputDTO } from '~/modules/auth/dto/Login'
import { RegisterInputDTO } from '~/modules/auth/dto/Register'
import { ResetPasswordInputDto } from '~/modules/auth/dto/ResetPassword'
import IAuthService from '~/modules/auth/services/IAuthService'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { handleControllerError } from '~/utils/handle.util'

export class AuthController {
  constructor(private authService: IAuthService) {
    this.authService = authService
  }
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body
      const loginDto = new LoginInputDTO({
        username: username,
        password: password
      })
      const result = await this.authService.login(loginDto)

      //trả về id accessToken refreshToken
      sendResponse(
        new ApiResponse({
          res: res,
          data: result,
          message: httpStatusMessage.CREATED,
          statusCode: httpStatusCode.CREATED
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async register(req: Request, res: Response) {
    try {
      // kiểm tra coi tồn tại email với username chưa, tồn tại rồi là k cho tạo luôn
      const { email, username, password, confirmPassword } = req.body
      const response = await this.authService.register(
        new RegisterInputDTO({
          email: email,
          username: username,
          password: password,
          confirmPassword: confirmPassword
        })
      )
      sendResponse(
        new ApiResponse({
          res: res,
          data: response,
          message: httpStatusMessage.CREATED,
          statusCode: httpStatusCode.CREATED
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async verifyAccount(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const verifyAccountInputDTO = new VerifyAccountInputDTO({
        email: email,
        password: password
      })
      const response = await this.authService.verifyAccount(verifyAccountInputDTO)
      sendResponse(
        new ApiResponse({
          res: res,
          data: response,
          message: httpStatusMessage.OK,
          statusCode: httpStatusCode.OK
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async resetPassword(req: Request, res: Response) {
    try {
      const { email, password, confirmPassword } = req.body

      const response = await this.authService.resetPassword(
        new ResetPasswordInputDto({
          email: email,
          password: password,
          confirmPassword: confirmPassword
        })
      )

      sendResponse(
        new ApiResponse({
          res: res,
          data: response,
          message: httpStatusMessage.OK,
          statusCode: httpStatusCode.OK
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
}
