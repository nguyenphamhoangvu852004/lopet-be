/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetListRoleOutputDTO } from '~/modules/role/dto/Get'
import IRoleRepo from '../repo/IRoleRepo'
import IRoleService from './IRoleService'

export default class RoleServiceImpl implements IRoleService {
  repo: IRoleRepo
  constructor(repo: IRoleRepo) {
    this.repo = repo
  }
  async getList(): Promise<GetListRoleOutputDTO[]> {
    const response = await this.repo.getList()
    const listDto: GetListRoleOutputDTO[] = []
    for (const i of response) {
      listDto.push(new GetListRoleOutputDTO({ id: i.id, name: i.name }))
    }
    return listDto
  }
  async createRoles(): Promise<any> {
    const list = await this.repo.createRoles()
    return list
  }
}
