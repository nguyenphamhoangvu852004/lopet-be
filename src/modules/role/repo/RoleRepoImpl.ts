import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { ROLENAME, Roles } from '~/entities/roles.entity'
import IRoleRepo from '~/modules/role/repo/IRoleRepo'

export default class RoleRepoImpl implements IRoleRepo {
  repo: Repository<Roles>
  constructor() {
    this.repo = mySqlDataSource.getRepository(Roles)
  }

  async getList(): Promise<Roles[]> {
    const list = await this.repo.find()
    return list
  }
  async createRoles(): Promise<Roles[]> {
    const listRole = [ROLENAME.ADMIN, ROLENAME.ADS]

    const list: Roles[] = []
    for (const i of listRole) {
      const role = await this.repo.findOneBy({ name: i })
      if (!role) {
        const newRole = new Roles()
        newRole.name = i
        newRole.createdAt = new Date()
        await this.repo.save(newRole)
        list.push(newRole)
      } else {
        list.push(role)
      }
    }
    return list
  }
}
