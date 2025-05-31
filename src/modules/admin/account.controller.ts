import { IAdminService } from './service/IAdminService'
export default class AdminController {
  service: IAdminService
  constructor(service: IAdminService) {
    this.service = service
  }

  async createAccountAdmin() {
    const response = await this.service.initAdmin()
    return response
  }
  async setRoleToAdmin() {
    const response = await this.service.setRoleToAdmin()
    return response
  }
}
