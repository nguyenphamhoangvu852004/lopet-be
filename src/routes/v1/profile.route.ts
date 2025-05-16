import { Router } from 'express'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AccountServiceImpl } from '~/modules/account/services/AccountServiceImpl'
import { ProfileController } from '~/modules/profile/controller'
import ProfileRepoImpl from '~/modules/profile/repositories/ProfileRepoImpl'
import ProfileServiceImpl from '~/modules/profile/services/ProfileServiceImpl'

export const profileRouter = Router()

const repo = new ProfileRepoImpl()
const profileService = new ProfileServiceImpl(repo)
const accoutRepo = new AccountRepoImpl()
const accountService = new AccountServiceImpl(accoutRepo)
const controller = new ProfileController(profileService, accountService)

profileRouter.post('/', controller.create.bind(controller))
profileRouter.post('/:id', controller.setToAccount.bind(controller))
profileRouter.get('/:id', controller.getById.bind(controller))
profileRouter.get('/accounts/:id', controller.getByAccountId.bind(controller))

profileRouter.patch('/:id', controller.update.bind(controller))
