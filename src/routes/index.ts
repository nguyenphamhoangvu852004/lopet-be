import { Router } from 'express'
import { accountRouter } from '~/routes/v1/account.route'
import { authRouter } from '~/routes/v1/auth.route'
import { emailRouter } from '~/routes/v1/email.route'
import { messageRouter } from '~/routes/v1/message.route'
import { profileRouter } from '~/routes/v1/profile.route'

export const router = Router()
router.use('/messages', messageRouter)
router.use('/auth', authRouter)
router.use('/accounts', accountRouter)
router.use('/emails', emailRouter)
router.use('/profiles', profileRouter)
