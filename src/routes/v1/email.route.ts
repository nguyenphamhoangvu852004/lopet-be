import { Router } from 'express'
import { EmailController } from '~/modules/email/controller'
import EmailServiceImpl from '~/modules/email/services/EmailServiceImpl'

const service = new EmailServiceImpl()
const controller = new EmailController(service)
export const emailRouter = Router()

emailRouter.post('/', controller.sendOTP.bind(controller))
emailRouter.post('/verify', controller.verifyOTP.bind(controller))
