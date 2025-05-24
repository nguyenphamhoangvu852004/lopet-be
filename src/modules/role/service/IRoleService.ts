import { GetListRoleOutputDTO } from "~/modules/role/dto/Get"

export default interface IRoleService {
  getList(): Promise<GetListRoleOutputDTO[]>
}
