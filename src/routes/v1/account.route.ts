import { Router } from 'express'
import { AccountController } from '~/modules/account/controller'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { AccountServiceImpl } from '~/modules/account/services/AccountServiceImpl'

export const accountRouter = Router()

const repo = new AccountRepoImpl()
const service = new AccountServiceImpl(repo)
const controller = new AccountController(service)

accountRouter.get('/:id',controller.getById.bind(controller))