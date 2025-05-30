import { Router } from 'express'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { NotificationController } from '~/modules/notification/controller'
import { NotificationsRepoImpl } from '~/modules/notification/repositories/NotificationRepoImpl'
import { NotificationServiceImpl } from '~/modules/notification/services/NotificationServiceImpl'
import ProfileRepoImpl from '~/modules/profile/repositories/ProfileRepoImpl'

export const notificationRouter = Router()
const notificationRepo = new NotificationsRepoImpl()
const accountRepo = new AccountRepoImpl()
const profileRepo = new ProfileRepoImpl()
const notificationService = new NotificationServiceImpl(notificationRepo, accountRepo, profileRepo)
const controller = new NotificationController(notificationService)

notificationRouter.post('/', verifyToken(), controller.create.bind(controller))
notificationRouter.get('/:id', verifyToken(), controller.getDetail.bind(controller))
notificationRouter.get('/me/:id', verifyToken(), controller.getList.bind(controller))
notificationRouter.put('/:id', verifyToken(), controller.update.bind(controller))
