import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { ROLENAME } from '~/entities/roles.entity'
import { validate } from '~/middlewares/validation.middleware'
import { verifyRole } from '~/middlewares/verifyRole'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AdvertisementController } from '~/modules/advertisement/controller'
import { AdvertisementRepositoriesImpl } from '~/modules/advertisement/repositories/AdvertisementRepositoriesImpl'
import { AdvertisementServiceImpl } from '~/modules/advertisement/services/AdvertisementServiceImpl'
import { advertisementValidation } from '~/validation/schema.validation'

export const advertisementRouter = Router()

const adRepo = new AdvertisementRepositoriesImpl()
const accountRepo = new AccountRepoImpl()
const service = new AdvertisementServiceImpl(adRepo, accountRepo)
const controller = new AdvertisementController(service)

const ROLE_HAS_PERMISSION = [ROLENAME.ADMIN, ROLENAME.ADS]

advertisementRouter.get('/', controller.getList.bind(controller))
advertisementRouter.get('/:id', controller.getDetail.bind(controller))
advertisementRouter.post(
  '/',
  verifyToken(),
  verifyRole(ROLE_HAS_PERMISSION),
  validate(advertisementValidation),
  upload.single('image'),
  controller.create.bind(controller)
)

advertisementRouter.put(
  '/:adsId',
  verifyToken(),
  verifyRole(ROLE_HAS_PERMISSION),
  upload.single('image'),
  controller.update.bind(controller)
)

advertisementRouter.delete('/:id', verifyToken(), verifyRole(ROLE_HAS_PERMISSION), controller.delete.bind(controller))
