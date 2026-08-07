import { Router } from 'express'
import { requirePermission } from '~/middlewares/requirePermission'
import { verifyToken } from '~/middlewares/verifyToken'
import { AccountController } from '~/modules/account/controller'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AccountServiceImpl } from '~/modules/account/services/AccountServiceImpl'
import { asyncHandler } from '~/utils/asyncHandler'

export const accountRouter = Router()

const repo = new AccountRepoImpl()
const service = new AccountServiceImpl(repo)
const controller = new AccountController(service)

accountRouter.get(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('account:read'),
  asyncHandler(controller.getList.bind(controller))
)

accountRouter.get(
  '/:id',
  asyncHandler(verifyToken()),
  asyncHandler(controller.getById.bind(controller))
)

accountRouter.post(
  '/ban/:id',
  asyncHandler(verifyToken()),
  requirePermission('account:ban'),
  asyncHandler(controller.banId.bind(controller))
)

accountRouter.post(
  '/unban/:id',
  asyncHandler(verifyToken()),
  requirePermission('account:ban'),
  asyncHandler(controller.unbanId.bind(controller))
)

accountRouter.delete(
  '/:id',
  asyncHandler(verifyToken()),
  requirePermission('account:delete'),
  asyncHandler(controller.delete.bind(controller))
)

accountRouter.get(
  '/suggest/:id',
  asyncHandler(verifyToken()),
  asyncHandler(controller.getSuggest.bind(controller))
)

/**
 * Endpoint nguy hiểm nhất của cả hệ thống: nó ghi thẳng vào account_role.
 * Trước đây chỉ có verifyToken nên bất kỳ ai đăng nhập cũng có thể tự gán
 * ADMIN cho chính mình. Giờ bắt buộc phải có quyền account:setRole.
 */
accountRouter.put(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('account:setRole'),
  asyncHandler(controller.setRolesToAccount.bind(controller))
)

export const moduleAccount = {
  repo,
  service,
  controller
}
