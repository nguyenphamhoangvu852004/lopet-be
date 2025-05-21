import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { validate } from '~/middlewares/validation.middleware'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AccountServiceImpl } from '~/modules/account/services/AccountServiceImpl'
import { ProfileController } from '~/modules/profile/controller'
import ProfileRepoImpl from '~/modules/profile/repositories/ProfileRepoImpl'
import ProfileServiceImpl from '~/modules/profile/services/ProfileServiceImpl'
import { profileValidation } from '~/validation/schema.validation'

export const profileRouter = Router()

const repo = new ProfileRepoImpl()
const profileService = new ProfileServiceImpl(repo)
const accoutRepo = new AccountRepoImpl()
const accountService = new AccountServiceImpl(accoutRepo)
const controller = new ProfileController(profileService, accountService)

profileRouter.post(
  '/',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  validate(profileValidation),
  controller.create.bind(controller)
)
profileRouter.get('/', controller.getList.bind(controller))
profileRouter.post('/:id', controller.setToAccount.bind(controller))
profileRouter.get('/:id', controller.getById.bind(controller))
profileRouter.get('/accounts/:id', controller.getByAccountId.bind(controller))

profileRouter.patch(
  '/:id',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  controller.update.bind(controller)
)
