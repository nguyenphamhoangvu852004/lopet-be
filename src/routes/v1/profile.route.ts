import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { Profiles } from '~/entities/profiles.entity'
import { requireOwnership } from '~/middlewares/requireOwnership'
import { requirePermission } from '~/middlewares/requirePermission'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AccountServiceImpl } from '~/modules/account/services/AccountServiceImpl'
import { ProfileController } from '~/modules/profile/controller'
import ProfileRepoImpl from '~/modules/profile/repositories/ProfileRepoImpl'
import ProfileServiceImpl from '~/modules/profile/services/ProfileServiceImpl'
import { asyncHandler } from '~/utils/asyncHandler'

export const profileRouter = Router()

const repo = new ProfileRepoImpl()
const profileService = new ProfileServiceImpl(repo)
const accoutRepo = new AccountRepoImpl()
const accountService = new AccountServiceImpl(accoutRepo)
const controller = new ProfileController(profileService, accountService)

/**
 * Hồ sơ cá nhân là dữ liệu riêng: KHÔNG cho ADMIN bỏ qua ownership.
 * Kiểm duyệt viên có quyền khoá tài khoản, không có việc sửa hộ hồ sơ.
 */
const mustOwnProfile = requireOwnership<Profiles>({
  load: (req) => repo.findById(Number(req.params.id)),
  ownerOf: (profile) => profile.account?.id,
  bypassRoles: []
})

/* ---------- Đọc: công khai ---------- */

profileRouter.get('/', asyncHandler(controller.getList.bind(controller)))
profileRouter.get('/:id', asyncHandler(controller.getById.bind(controller)))
profileRouter.get(
  '/accounts/:id',
  asyncHandler(controller.getByAccountId.bind(controller))
)

/* ---------- Ghi: bắt buộc xác thực ---------- */

/**
 * Trước đây hai route ghi dưới đây KHÔNG có verifyToken. Riêng setToAccount còn
 * nhận accountId từ body, nên bất kỳ ai — kể cả chưa đăng nhập — đều có thể gắn
 * một hồ sơ tuỳ ý vào tài khoản của người khác.
 */
profileRouter.post(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('profile:update:own'),
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  asyncHandler(controller.create.bind(controller))
)

profileRouter.post(
  '/:id',
  asyncHandler(verifyToken()),
  requirePermission('profile:update:own'),
  asyncHandler(controller.setToAccount.bind(controller))
)

profileRouter.patch(
  '/:id',
  asyncHandler(verifyToken()),
  requirePermission('profile:update:own'),
  // Trước upload.fields() để không tốn lượt upload cho request sẽ bị từ chối
  mustOwnProfile,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  asyncHandler(controller.update.bind(controller))
)
