import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Roles } from '~/entities/roles.entity'
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
}
