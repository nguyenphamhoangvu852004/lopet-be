import { GROUPTYPE } from '~/entities/groups.entity'

export class ModifyGroupInputDTO {
  id!: number
  name?: string
  type?: GROUPTYPE
  bio?: string
  /** Tài khoản đang thao tác — bắt buộc vì dùng để kiểm tra quyền quản trị group */
  owner!: number
  image?: string
  constructor(data?: Partial<ModifyGroupInputDTO>) {
    Object.assign(this, data)
  }
}

export class ModifyGroupOutputDTO {
  id!: number
  success!: boolean
  constructor(data?: Partial<ModifyGroupOutputDTO>) {
    Object.assign(this, data)
  }
}
