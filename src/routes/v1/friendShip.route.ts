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

friendShipRouter.post('/', controller.create.bind(controller))
