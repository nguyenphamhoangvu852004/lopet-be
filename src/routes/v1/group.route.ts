import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { requirePermission } from '~/middlewares/requirePermission'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { GroupController } from '~/modules/group/controller'
import GroupRepoImpl from '~/modules/group/repositories/GroupRepoImpl'
import GroupServiceImpl from '~/modules/group/services/GroupServiceImpl'
import { asyncHandler } from '~/utils/asyncHandler'

export const groupRouter = Router()

const groupRepo = new GroupRepoImpl()
const accountRepo = new AccountRepoImpl()
const service = new GroupServiceImpl(groupRepo, accountRepo)
const controller = new GroupController(service)

/**
 * Trước đây các route này đòi role ADMIN — sai nghiệp vụ: mọi user đều phải tạo
 * được nhóm. Sở dĩ app vẫn chạy là vì verifyRole() đang là no-op.
 *
 * Quyền group:* nằm trong baseline nên ai đăng nhập cũng qua tầng permission.
 * Việc "có phải chủ nhóm không" do tầng service kiểm qua group_members.role,
 * vì ownership của group là quan hệ chứ không phải role toàn cục.
 */

groupRouter.get(
  '/suggest',
  asyncHandler(controller.getListSuggest.bind(controller))
)
groupRouter.get('/:id', asyncHandler(controller.getById.bind(controller)))
groupRouter.get(
  '/owned/:id',
  asyncHandler(controller.getListOwned.bind(controller))
)
groupRouter.get(
  '/joined/:id',
  asyncHandler(controller.getListJoined.bind(controller))
)

groupRouter.post(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('group:create'),
  upload.single('image'),
  asyncHandler(controller.create.bind(controller))
)

groupRouter.post(
  '/invites',
  asyncHandler(verifyToken()),
  requirePermission('group:update:own'),
  asyncHandler(controller.addMember.bind(controller))
)

groupRouter.delete(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('group:delete:own', 'group:delete'),
  asyncHandler(controller.deleteGroup.bind(controller))
)

groupRouter.delete(
  '/members',
  asyncHandler(verifyToken()),
  requirePermission('group:update:own'),
  asyncHandler(controller.removeMember.bind(controller))
)

groupRouter.put(
  '/:id',
  asyncHandler(verifyToken()),
  requirePermission('group:update:own'),
  upload.single('image'),
  asyncHandler(controller.modifyGroup.bind(controller))
)
