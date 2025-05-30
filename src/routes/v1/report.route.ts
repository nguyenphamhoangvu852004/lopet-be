import { Router } from 'express'
import { ROLENAME } from '~/entities/roles.entity'
import { verifyRole } from '~/middlewares/verifyRole'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import GroupRepoImpl from '~/modules/group/repositories/GroupRepoImpl'
import PostRepoImpl from '~/modules/post/repositories/PostRepoImpl'
import { ReportController } from '~/modules/report/controller'
import { ReportRepoImpl } from '~/modules/report/repositories/ReportRepoImpl'
import { ReportServiceImpl } from '~/modules/report/services/ReportServiceImpl'

export const reportRouter = Router()

const reportRepo = new ReportRepoImpl()
const accountRepo = new AccountRepoImpl()
const groupRepo = new GroupRepoImpl()
const postRepo = new PostRepoImpl()
const reportService = new ReportServiceImpl(reportRepo, accountRepo, groupRepo, postRepo)
const controller = new ReportController(reportService)
const ROLE_HAS_PERMISSION = [ROLENAME.ADMIN]
reportRouter.get('/', verifyToken(), controller.getList.bind(controller))
reportRouter.post('/', verifyToken(), controller.create.bind(controller))
reportRouter.put('/:targetId', verifyToken(), verifyRole(ROLE_HAS_PERMISSION), controller.update.bind(controller))
