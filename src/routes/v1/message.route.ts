import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { MessageController } from '~/modules/message/controller'
import { MessageRepoImpl } from '~/modules/message/repositories/MessageRepoImpl'
import MessageServiceImpl from '~/modules/message/services/MessageServiceImpl'
import ProfileRepoImpl from '~/modules/profile/repositories/ProfileRepoImpl'

export const messageRouter = Router()

const messageRepo = new MessageRepoImpl()
const accountRepo = new AccountRepoImpl()
const profileRepo = new ProfileRepoImpl()
const service = new MessageServiceImpl(messageRepo, accountRepo, profileRepo)
const controller = new MessageController(service)

messageRouter.get('/:id', verifyToken(), controller.getDetail.bind(controller))
messageRouter.get('/me/:id', verifyToken(), controller.getListMessage.bind(controller))
messageRouter.post('/', verifyToken(), upload.single('image'), controller.createMessage.bind(controller))
messageRouter.patch('/status/:id', verifyToken(), controller.updateStatus.bind(controller))
