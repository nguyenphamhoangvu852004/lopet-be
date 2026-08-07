import { Router } from 'express'
import { requireFriendOrSelf } from '~/middlewares/requireFriendOrSelf'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { FriendShipController } from '~/modules/friendShip/controller'
import FriendShipRepositoriesImpl from '~/modules/friendShip/repositories/FriendShipRepositoriesImpl'
import { FriendShipServiceImpl } from '~/modules/friendShip/services/FriendShipServiceImpl'
import { asyncHandler } from '~/utils/asyncHandler'
export const friendShipRouter = Router()

const friendShipRepo = new FriendShipRepositoriesImpl()
const accountRepo = new AccountRepoImpl()
const service = new FriendShipServiceImpl(friendShipRepo, accountRepo)
const controller = new FriendShipController(service)

/**
 * Danh sách bạn bè (ACCEPTED) của một tài khoản.
 *
 * Trước đây chỉ cần đăng nhập là xem được danh sách bạn bè của bất kỳ ai.
 * Giờ giới hạn ở chính chủ và bạn bè của họ.
 */
friendShipRouter.get(
  '/:id',
  asyncHandler(verifyToken()),
  requireFriendOrSelf(friendShipRepo),
  asyncHandler(controller.getListFriendShipsOfAccount.bind(controller))
)

/**
 * Hai route dưới đây có `:id` trên đường dẫn nhưng controller bỏ qua nó và
 * dùng req.user.id — nghĩa là chúng luôn trả về dữ liệu của chính người gọi.
 * Giữ nguyên hành vi đó, không cần kiểm thêm.
 */
friendShipRouter.get(
  '/send/:id',
  asyncHandler(verifyToken()),
  asyncHandler(controller.getListSendFriendShips.bind(controller))
)

friendShipRouter.get(
  '/receive/:id',
  asyncHandler(verifyToken()),
  asyncHandler(controller.getListReceiveFriendShips.bind(controller))
)
friendShipRouter.post(
  '/',
  verifyToken(),
  asyncHandler(controller.create.bind(controller))
)
friendShipRouter.post(
  '/accept',
  verifyToken(),
  asyncHandler(controller.accept.bind(controller))
)
friendShipRouter.post(
  '/reject',
  verifyToken(),
  asyncHandler(controller.reject.bind(controller))
)

friendShipRouter.delete(
  '/',
  verifyToken(),
  asyncHandler(controller.delete.bind(controller))
)
