import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { ROLENAME } from '~/entities/roles.entity'
import { verifyRole } from '~/middlewares/verifyRole'
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
const ROLE_HAS_PERMISSION = [ROLENAME.ADMIN]
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
  verifyRole(ROLE_HAS_PERMISSION),
  upload.single('image'),
  asyncHandler(controller.create.bind(controller))
)
groupRouter.post(
  '/invites',
  asyncHandler(verifyToken()),
  verifyRole(ROLE_HAS_PERMISSION),
  asyncHandler(controller.addMember.bind(controller))
)

groupRouter.delete(
  '/',
  asyncHandler(verifyToken()),
  verifyRole(ROLE_HAS_PERMISSION),
  asyncHandler(controller.deleteGroup.bind(controller))
)
groupRouter.delete(
  '/members',
  asyncHandler(verifyToken()),
  verifyRole(ROLE_HAS_PERMISSION),
  asyncHandler(controller.removeMember.bind(controller))
)

groupRouter.put(
  '/:id',
  asyncHandler(verifyToken()),
  verifyRole(ROLE_HAS_PERMISSION),
  upload.single('image'),
  asyncHandler(controller.modifyGroup.bind(controller))
)
