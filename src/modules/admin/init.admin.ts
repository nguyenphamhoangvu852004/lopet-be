import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import AdminController from './account.controller'
import AdminServiceImpl from './service/AdminServiceImpl'

export default class InitAdmin {
  adminController: AdminController
  constructor() {
    const accountRepo = new AccountRepoImpl()
    const adminService = new AdminServiceImpl(accountRepo)
    this.adminController = new AdminController(adminService)
  }

  async init() {
    await this.adminController.createAccountAdmin()
    await this.adminController.setRoleToAdmin()
  }
}
