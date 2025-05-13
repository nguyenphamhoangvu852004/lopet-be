import { Router } from 'express'
import { messageRouter } from '~/routes/v1/message.route'

export const router = Router()
router.use('/messages', messageRouter)
