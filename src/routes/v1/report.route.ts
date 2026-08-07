import { Router } from 'express'
import { requirePermission } from '~/middlewares/requirePermission'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import GroupRepoImpl from '~/modules/group/repositories/GroupRepoImpl'
import PostRepoImpl from '~/modules/post/repositories/PostRepoImpl'
import { ReportController } from '~/modules/report/controller'
import { ReportRepoImpl } from '~/modules/report/repositories/ReportRepoImpl'
import { ReportServiceImpl } from '~/modules/report/services/ReportServiceImpl'
import { asyncHandler } from '~/utils/asyncHandler'

export const reportRouter = Router()

const reportRepo = new ReportRepoImpl()
const accountRepo = new AccountRepoImpl()
const groupRepo = new GroupRepoImpl()
const postRepo = new PostRepoImpl()
const reportService = new ReportServiceImpl(
  reportRepo,
  accountRepo,
  groupRepo,
  postRepo
)
const controller = new ReportController(reportService)

// Xem danh sách báo cáo là việc của staff — trước đây chỉ cần đăng nhập
reportRouter.get(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('report:read'),
  asyncHandler(controller.getList.bind(controller))
)

// Gửi báo cáo thuộc baseline: mọi user đã đăng nhập đều được
reportRouter.post(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('report:create'),
  asyncHandler(controller.create.bind(controller))
)

reportRouter.put(
  '/:targetId',
  asyncHandler(verifyToken()),
  requirePermission('report:resolve'),
  asyncHandler(controller.update.bind(controller))
)
