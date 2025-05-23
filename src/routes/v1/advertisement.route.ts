import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { validate } from '~/middlewares/validation.middleware'
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

advertisementRouter.get('/', controller.getList.bind(controller))
advertisementRouter.get('/:id', controller.getDetail.bind(controller))
advertisementRouter.post(
  '/',
  validate(advertisementValidation),
  upload.single('image'),
  controller.create.bind(controller)
)
advertisementRouter.delete('/:id', controller.delete.bind(controller))
