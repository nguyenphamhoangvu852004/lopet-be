import { Router } from 'express'
import { EmailController } from '~/modules/email/controller'
import EmailServiceImpl from '~/modules/email/services/EmailServiceImpl'
import { asyncHandler } from '~/utils/asyncHandler'

const service = new EmailServiceImpl()
const controller = new EmailController(service)
export const emailRouter = Router()

emailRouter.post('/', asyncHandler(controller.sendOTP.bind(controller)))
emailRouter.post('/verify', asyncHandler(controller.verifyOTP.bind(controller)))
