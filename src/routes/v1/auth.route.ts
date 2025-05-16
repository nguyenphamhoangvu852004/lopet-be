import { Router } from 'express'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AuthController } from '~/modules/auth/controller'
import AuthServiceImpl from '~/modules/auth/services/AuthServiceImpl'

export const authRouter = Router()
const accountRepo = new AccountRepoImpl()
const authService = new AuthServiceImpl(accountRepo)
const controller = new AuthController(authService)

// Login with Facebook

authRouter.post('/login', controller.login.bind(controller))
authRouter.post('/signup', controller.register.bind(controller))
