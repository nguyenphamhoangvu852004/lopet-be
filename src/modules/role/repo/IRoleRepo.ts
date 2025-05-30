import { Roles } from '../../../entities/roles.entity'

export default interface IRoleRepo {
  getList(): Promise<Roles[]>
  createRoles(): Promise<Roles[]>
}
