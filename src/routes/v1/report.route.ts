import { Router } from 'express'
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

reportRouter.get('/', controller.getList.bind(controller))
reportRouter.post('/', controller.create.bind(controller))
reportRouter.put('/:targetId', controller.update.bind(controller))
