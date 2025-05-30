/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetListRoleOutputDTO } from '~/modules/role/dto/Get'

export default interface IRoleService {
  getList(): Promise<GetListRoleOutputDTO[]>
  createRoles(): Promise<any>
}
