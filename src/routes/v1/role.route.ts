import { Router } from 'express'
import { verifyToken } from '~/middlewares/verifyToken'
import RoleController from '~/modules/role/controller'
import RoleRepoImpl from '~/modules/role/repo/RoleRepoImpl'
import RoleServiceImpl from '~/modules/role/service/RoleServiceImpl'

export const roleRouter = Router()

const repo = new RoleRepoImpl()
const roleService = new RoleServiceImpl(repo)
const controller = new RoleController(roleService)

roleRouter.get('/', verifyToken(), controller.getList.bind(controller))
