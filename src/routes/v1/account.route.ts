import { Router } from 'express'
import { verifyToken } from '~/middlewares/verifyToken'
import { AccountController } from '~/modules/account/controller'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AccountServiceImpl } from '~/modules/account/services/AccountServiceImpl'
import { asyncHandler } from '~/utils/asyncHandler'

export const accountRouter = Router()

const repo = new AccountRepoImpl()
const service = new AccountServiceImpl(repo)
const controller = new AccountController(service)

accountRouter.get('/', asyncHandler(controller.getList.bind(controller)))
accountRouter.get('/:id', asyncHandler(controller.getById.bind(controller)))
accountRouter.post(
  '/ban/:id',
  asyncHandler(verifyToken()),
  asyncHandler(controller.banId.bind(controller))
)
accountRouter.post(
  '/unban/:id',
  asyncHandler(verifyToken()),
  asyncHandler(controller.unbanId.bind(controller))
)
accountRouter.delete(
  '/:id',
  asyncHandler(verifyToken()),
  asyncHandler(controller.delete.bind(controller))
)
accountRouter.get(
  '/suggest/:id',
  asyncHandler(verifyToken()),
  asyncHandler(controller.getSuggest.bind(controller))
)
accountRouter.put(
  '/',
  asyncHandler(verifyToken()),
  asyncHandler(controller.setRolesToAccount.bind(controller))
)

export const moduleAccount = {
  repo,
  service,
  controller
}
