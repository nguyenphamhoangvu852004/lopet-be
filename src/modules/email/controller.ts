import { Request, Response } from 'express'
import { httpStatusCode } from '~/global/httpStatusCode'
import { IEmailService } from '~/modules/email/services/IEmailService'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { handleControllerError } from '~/utils/handle.util'
export class EmailController {
  constructor(private emailService: IEmailService) {
    this.emailService = emailService
  }
  async sendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body
      await this.emailService.sendOTP(email)
      sendResponse(new ApiResponse({ res: res, statusCode: httpStatusCode.OK, message: 'Send email successfully' }))
      return
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body
      await this.emailService.verify({ email, otp })
      sendResponse(new ApiResponse({ res: res, statusCode: httpStatusCode.OK, message: 'Verify email successfully' }))
      return
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
}
