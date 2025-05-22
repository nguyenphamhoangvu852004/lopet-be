import { Router } from 'express'
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
friendShipRouter.get('/:id', controller.getListFriendShipsOfAccount.bind(controller))

// Lấy danh sách những người mà accountId này đã gữi lời mời kết bạn (PENDING)
friendShipRouter.get('/send/:id', controller.getListSendFriendShips.bind(controller))
friendShipRouter.post('/', controller.create.bind(controller))
friendShipRouter.post('/accept', controller.accept.bind(controller))
friendShipRouter.post('/reject', controller.reject.bind(controller))

friendShipRouter.delete('/', controller.delete.bind(controller))
