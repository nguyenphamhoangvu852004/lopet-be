import { Router } from 'express'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { GroupController } from '~/modules/group/controller'
import GroupRepoImpl from '~/modules/group/repositories/GroupRepoImpl'
import GroupServiceImpl from '~/modules/group/services/GroupServiceImpl'

export const groupRouter = Router()

const groupRepo = new GroupRepoImpl()
const accountRepo = new AccountRepoImpl()
const service = new GroupServiceImpl(groupRepo, accountRepo)
const controller = new GroupController(service)

groupRouter.get('/suggest', controller.getListSuggest.bind(controller))
groupRouter.get('/:id', controller.getById.bind(controller))
groupRouter.get('/owned/:id', controller.getListOwned.bind(controller))
groupRouter.get('/joined/:id', controller.getListJoined.bind(controller))

groupRouter.post('/', controller.create.bind(controller))
groupRouter.post('/invites', controller.addMember.bind(controller))

groupRouter.delete('/', controller.deleteGroup.bind(controller))
groupRouter.delete('/members', controller.removeMember.bind(controller))
