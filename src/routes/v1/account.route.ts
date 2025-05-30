import { Router } from 'express'
import { ROLENAME } from '~/entities/roles.entity'
import { verifyRole } from '~/middlewares/verifyRole'
import { verifyToken } from '~/middlewares/verifyToken'
import { AccountController } from '~/modules/account/controller'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AccountServiceImpl } from '~/modules/account/services/AccountServiceImpl'

export const accountRouter = Router()

const repo = new AccountRepoImpl()
const service = new AccountServiceImpl(repo)
const controller = new AccountController(service)
const ROLE_HAS_PERMISSION = [ROLENAME.ADMIN]
accountRouter.get('/', controller.getList.bind(controller))
accountRouter.get('/:id', controller.getById.bind(controller))
accountRouter.post('/ban/:id', verifyToken(), verifyRole(ROLE_HAS_PERMISSION), controller.banId.bind(controller))
accountRouter.post('/unban/:id', verifyToken(), verifyRole(ROLE_HAS_PERMISSION), controller.unbanId.bind(controller))
accountRouter.delete('/:id', verifyToken(), verifyRole(ROLE_HAS_PERMISSION), controller.delete.bind(controller))
accountRouter.get('/suggest/:id', verifyToken(), controller.getSuggest.bind(controller))
accountRouter.put('/', verifyToken(), controller.setRolesToAccount.bind(controller))
