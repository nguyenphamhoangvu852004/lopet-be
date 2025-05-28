import { Router } from 'express'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { NotificationController } from '~/modules/notification/controller'
import { NotificationsRepoImpl } from '~/modules/notification/repositories/NotificationRepoImpl'
import { NotificationServiceImpl } from '~/modules/notification/services/NotificationServiceImpl'

export const notificationRouter = Router()
const notificationRepo = new NotificationsRepoImpl()
const accountRepo = new AccountRepoImpl()
const notificationService = new NotificationServiceImpl(notificationRepo, accountRepo)
const controller = new NotificationController(notificationService)

notificationRouter.post('/', controller.create.bind(controller))
notificationRouter.get('/me/:id', controller.getList.bind(controller))

