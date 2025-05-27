import { GetListRoleOutputDTO } from '~/modules/role/dto/Get'
import IRoleRepo from '../repo/IRoleRepo'
import IRoleService from './IRoleService'
import { handleThrowError } from '~/utils/handle.util'

export default class RoleServiceImpl implements IRoleService {
  repo: IRoleRepo
  constructor(repo: IRoleRepo) {
    this.repo = repo
  }
  async getList(): Promise<GetListRoleOutputDTO[]> {
    try {
      const response = await this.repo.getList()
      const listDto: GetListRoleOutputDTO[] = []
      for (const i of response) {
        listDto.push(new GetListRoleOutputDTO({ id: i.id, name: i.name }))
      }
      return listDto
    } catch (error) {
      handleThrowError(error)
    }
  }
}
