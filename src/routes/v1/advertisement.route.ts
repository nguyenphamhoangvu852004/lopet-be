import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { Advertisements } from '~/entities/advertisements.entity'
import { requireApprovedAdvertiser } from '~/middlewares/requireApprovedAdvertiser'
import { requireOwnership } from '~/middlewares/requireOwnership'
import { requirePermission } from '~/middlewares/requirePermission'
import { validate } from '~/middlewares/validation.middleware'
import { verifyToken } from '~/middlewares/verifyToken'
import { AdvertisementController } from '~/modules/advertisement/controller'
import { AdvertisementRepositoriesImpl } from '~/modules/advertisement/repositories/AdvertisementRepositoriesImpl'
import { AdvertisementServiceImpl } from '~/modules/advertisement/services/AdvertisementServiceImpl'
import AdvertiserProfileRepoImpl from '~/modules/advertiser/repositories/AdvertiserProfileRepoImpl'
import { asyncHandler } from '~/utils/asyncHandler'
import { advertisementValidation } from '~/validation/schema.validation'

export const advertisementRouter = Router()

const adRepo = new AdvertisementRepositoriesImpl()
const advertiserRepo = new AdvertiserProfileRepoImpl()
const service = new AdvertisementServiceImpl(adRepo, advertiserRepo)
const controller = new AdvertisementController(service)

/**
 * Role ADS đã bị bỏ: tư cách nhà quảng cáo là capability ở advertiser_profiles,
 * không phải role. Ba tầng kiểm tra cho một thao tác ghi:
 *
 *   1. requirePermission          — hành động này có được phép không
 *   2. requireApprovedAdvertiser  — có tư cách chạy quảng cáo chưa (APPROVED)
 *   3. requireOwnership           — đúng quảng cáo của mình không (ADMIN bỏ qua)
 *
 * Thứ tự quan trọng: cả ba phải đứng TRƯỚC upload.single(), vì controller đẩy
 * ảnh lên Cloudinary ngay đầu hàm — chặn muộn thì request bị từ chối vẫn kịp
 * tốn một lượt upload.
 */
const loadAdsOwner = requireOwnership<Advertisements>({
  load: (req) => adRepo.findById(Number(req.params.adsId ?? req.params.id)),
  ownerOf: (ads) => ads.advertiser?.account?.id
})
const mustBeAdvertiser = requireApprovedAdvertiser(advertiserRepo)

advertisementRouter.get('/', asyncHandler(controller.getList.bind(controller)))
advertisementRouter.get(
  '/:id',
  asyncHandler(controller.getDetail.bind(controller))
)
advertisementRouter.post(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('ads:create'),
  mustBeAdvertiser,
  validate(advertisementValidation),
  upload.single('image'),
  asyncHandler(controller.create.bind(controller))
)

advertisementRouter.put(
  '/:adsId',
  asyncHandler(verifyToken()),
  requirePermission('ads:update:own'),
  loadAdsOwner,
  upload.single('image'),
  asyncHandler(controller.update.bind(controller))
)

advertisementRouter.delete(
  '/:id',
  asyncHandler(verifyToken()),
  requirePermission('ads:delete:own'),
  loadAdsOwner,
  asyncHandler(controller.delete.bind(controller))
)

// export const container = {
//   repo,
//   service,
//   controller
// }
