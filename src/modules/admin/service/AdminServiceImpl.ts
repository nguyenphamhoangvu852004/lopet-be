/* eslint-disable @typescript-eslint/no-explicit-any */
import { environment } from '~/config/env'
import { ROLENAME } from '~/entities/roles.entity'
import { BadRequest, Conflict } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { IAdminService } from '~/modules/admin/service/IAdminService'
import { hashPassword } from '~/utils/bcryptjs.util'
import { handleThrowError } from '~/utils/handle.util'

export default class AdminServiceImpl implements IAdminService {
  accountRepo: IAccountRepo
  constructor(accountRepo: IAccountRepo) {
    this.accountRepo = accountRepo
  }

  async initAdmin(): Promise<any> {
    try {
      const isExist = await this.accountRepo.checkAccountExistByEmail(environment.INIT_ADMIN_EMAIL as string)
      if (!isExist) {
        const adminPass = environment.INIT_ADMIN_PASSWORD as string
        const hashedPassword = await hashPassword(adminPass)
        const admin = await this.accountRepo.create({
          username: environment.INIT_ADMIN_USERNAME as string,
          email: environment.INIT_ADMIN_EMAIL as string,
          password: hashedPassword,
          id: 0,
          isBanned: 0,
          profile: null,
          groups: [],
          memberGroups: [],
          posts: [],
          roles: [],
          postlikes: [],
          reports: [],
          sentFriendRequests: [],
          receivedFriendRequests: [],
          advertisements: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: null,
          deletedAt: null
        })
        return admin
      } else {
        return null
      }
    } catch (error) {
      handleThrowError(error)
    }
  }

  async setRoleToAdmin(): Promise<any> {
    try {
      const admin = await this.accountRepo.findByEmail(environment.INIT_ADMIN_EMAIL as string)
      if (!admin) {
        throw new BadRequest('No Admin to set role')
      }
      return await this.accountRepo.setRolesToAccount(admin.id, [ROLENAME.ADMIN])
    } catch (error) {
      handleThrowError(error)
    }
  }
}
