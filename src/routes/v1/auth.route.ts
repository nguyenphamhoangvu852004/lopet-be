import { Router } from 'express'
import { validate } from '~/middlewares/validation.middleware'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AuthController } from '~/modules/auth/controller'
import AuthServiceImpl from '~/modules/auth/services/AuthServiceImpl'
import { loginValidation, registerValidation, resetPasswordValidation } from '~/validation/schema.validation'

export const authRouter = Router()
const accountRepo = new AccountRepoImpl()
const authService = new AuthServiceImpl(accountRepo)
const controller = new AuthController(authService)

// Login with Facebook
authRouter.post('/verify', controller.verifyAccount.bind(controller))
authRouter.post('/reset', validate(resetPasswordValidation), controller.resetPassword.bind(controller))
authRouter.post('/login', validate(loginValidation), controller.login.bind(controller))
authRouter.post('/signup', validate(registerValidation), controller.register.bind(controller))
