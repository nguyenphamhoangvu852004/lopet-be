import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { ROLENAME } from '~/entities/roles.entity'
import { validate } from '~/middlewares/validation.middleware'
import { verifyRole } from '~/middlewares/verifyRole'
import { verifyToken } from '~/middlewares/verifyToken'
import { AdvertisementController } from '~/modules/advertisement/controller'
import { AdvertisementRepositoriesImpl } from '~/modules/advertisement/repositories/AdvertisementRepositoriesImpl'
import { AdvertisementServiceImpl } from '~/modules/advertisement/services/AdvertisementServiceImpl'
import { asyncHandler } from '~/utils/asyncHandler'
import { advertisementValidation } from '~/validation/schema.validation'
import { moduleAccount } from './account.route'

export const advertisementRouter = Router()

const adRepo = new AdvertisementRepositoriesImpl()
const accountRepo = moduleAccount.repo
const service = new AdvertisementServiceImpl(adRepo, accountRepo)
const controller = new AdvertisementController(service)

const ROLE_HAS_PERMISSION = [ROLENAME.ADMIN, ROLENAME.ADS]

advertisementRouter.get('/', asyncHandler(controller.getList.bind(controller)))
advertisementRouter.get(
  '/:id',
  asyncHandler(controller.getDetail.bind(controller))
)
advertisementRouter.post(
  '/',
  asyncHandler(verifyToken()),
  asyncHandler(verifyRole(ROLE_HAS_PERMISSION)),
  validate(advertisementValidation),
  upload.single('image'),
  asyncHandler(controller.create.bind(controller))
)

advertisementRouter.put(
  '/:adsId',
  asyncHandler(verifyToken()),
  asyncHandler(verifyRole(ROLE_HAS_PERMISSION)),
  upload.single('image'),
  asyncHandler(controller.update.bind(controller))
)

advertisementRouter.delete(
  '/:id',
  asyncHandler(verifyToken()),
  asyncHandler(verifyRole(ROLE_HAS_PERMISSION)),
  asyncHandler(controller.delete.bind(controller))
)

// export const container = {
//   repo,
//   service,
//   controller
// }
