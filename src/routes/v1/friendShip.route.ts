import { Router } from 'express'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { FriendShipController } from '~/modules/friendShip/controller'
import FriendShipRepositoriesImpl from '~/modules/friendShip/repositories/FriendShipRepositoriesImpl'
import { FriendShipServiceImpl } from '~/modules/friendShip/services/FriendShipServiceImpl'
export const friendShipRouter = Router()

const friendShipRepo = new FriendShipRepositoriesImpl()
const accountRepo = new AccountRepoImpl()
const service = new FriendShipServiceImpl(friendShipRepo, accountRepo)
const controller = new FriendShipController(service)

// danh sách những người mà accountId đã trở thành bạn bè với người ta (ACCEPTED)
friendShipRouter.get('/:id', verifyToken(), controller.getListFriendShipsOfAccount.bind(controller))

// Lấy danh sách những người mà accountId này đã gữi lời mời kết bạn (PENDING)
friendShipRouter.get('/send/:id', verifyToken(), controller.getListSendFriendShips.bind(controller))

// Lấy danh sách những người gữi lời mời kết bạn đến AccountID này
friendShipRouter.get('/receive/:id', verifyToken(), controller.getListReceiveFriendShips.bind(controller))
friendShipRouter.post('/', verifyToken(), controller.create.bind(controller))
friendShipRouter.post('/accept', verifyToken(), controller.accept.bind(controller))
friendShipRouter.post('/reject', verifyToken(), controller.reject.bind(controller))

friendShipRouter.delete('/', verifyToken(), controller.delete.bind(controller))
