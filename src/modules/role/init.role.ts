import RoleController from '~/modules/role/controller'
import RoleRepoImpl from '~/modules/role/repo/RoleRepoImpl'
import RoleServiceImpl from '~/modules/role/service/RoleServiceImpl'

export default class InitRole {
  constructor() {
    const roleRepo = new RoleRepoImpl()
    const roleService = new RoleServiceImpl(roleRepo)
    const roleController = new RoleController(roleService)
    roleController.createRoles()
  }
}
