import { Router } from 'express'
import { requirePermission } from '~/middlewares/requirePermission'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AdvertiserController } from '~/modules/advertiser/controller'
import AdvertiserProfileRepoImpl from '~/modules/advertiser/repositories/AdvertiserProfileRepoImpl'
import AdvertiserProfileServiceImpl from '~/modules/advertiser/services/AdvertiserProfileServiceImpl'
import { asyncHandler } from '~/utils/asyncHandler'

export const advertiserRouter = Router()

const advertiserRepo = new AdvertiserProfileRepoImpl()
const accountRepo = new AccountRepoImpl()
const service = new AdvertiserProfileServiceImpl(advertiserRepo, accountRepo)
const controller = new AdvertiserController(service)

/**
 * Vòng đời tư cách nhà quảng cáo. Trước đây "được chạy quảng cáo" là role ADS
 * cấp tay, không có bước duyệt và không có trạng thái nào cả.
 */

// Baseline: mọi user đã đăng nhập đều được nộp hồ sơ (tạo ra bản ghi PENDING)
advertiserRouter.post(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('advertiser:register'),
  asyncHandler(controller.register.bind(controller))
)

advertiserRouter.get(
  '/me',
  asyncHandler(verifyToken()),
  asyncHandler(controller.getMine.bind(controller))
)

// Staff
advertiserRouter.get(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('advertiser:read'),
  asyncHandler(controller.getList.bind(controller))
)

advertiserRouter.put(
  '/:id/status',
  asyncHandler(verifyToken()),
  requirePermission('advertiser:approve'),
  asyncHandler(controller.review.bind(controller))
)
