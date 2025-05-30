import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { ROLENAME } from '~/entities/roles.entity'
import { verifyRole } from '~/middlewares/verifyRole'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { GroupController } from '~/modules/group/controller'
import GroupRepoImpl from '~/modules/group/repositories/GroupRepoImpl'
import GroupServiceImpl from '~/modules/group/services/GroupServiceImpl'

export const groupRouter = Router()

const groupRepo = new GroupRepoImpl()
const accountRepo = new AccountRepoImpl()
const service = new GroupServiceImpl(groupRepo, accountRepo)
const controller = new GroupController(service)
const ROLE_HAS_PERMISSION = [ROLENAME.ADMIN]
groupRouter.get('/suggest', controller.getListSuggest.bind(controller))
groupRouter.get('/:id', controller.getById.bind(controller))
groupRouter.get('/owned/:id', controller.getListOwned.bind(controller))
groupRouter.get('/joined/:id', controller.getListJoined.bind(controller))

groupRouter.post(
  '/',
  verifyToken(),
  verifyRole(ROLE_HAS_PERMISSION),
  upload.single('image'),
  controller.create.bind(controller)
)
groupRouter.post('/invites', verifyToken(), verifyRole(ROLE_HAS_PERMISSION), controller.addMember.bind(controller))

groupRouter.delete('/', verifyToken(), verifyRole(ROLE_HAS_PERMISSION), controller.deleteGroup.bind(controller))
groupRouter.delete('/members', verifyToken(), verifyRole(ROLE_HAS_PERMISSION), controller.removeMember.bind(controller))

groupRouter.put(
  '/:id',
  verifyToken(),
  verifyRole(ROLE_HAS_PERMISSION),
  upload.single('image'),
  controller.modifyGroup.bind(controller)
)
