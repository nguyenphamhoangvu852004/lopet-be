import { GroupMembers, GROUPMEMBERROLE } from '~/entities/groupMembers.entity'
import { Groups } from '~/entities/groups.entity'

export default interface IGroupRepo {
  create(data: Groups): Promise<Groups | null>
  findById(id: number): Promise<Groups | null>
  getListSuggest(): Promise<Groups[]>
  getListOwned(data: number): Promise<Groups[]>
  getListJoined(data: number): Promise<Groups[]>
  update(data: Groups): Promise<Groups | null>
  delete(data: number): Promise<Groups | null>

  /** Đúng vai OWNER của group — dùng cho hành động huỷ diệt (xoá group) */
  isOwned(groupId: number, accountId: number): Promise<boolean>

  /** OWNER hoặc ADMIN của group — dùng cho hành động quản trị thường ngày */
  canManage(groupId: number, accountId: number): Promise<boolean>

  findMember(groupId: number, accountId: number): Promise<GroupMembers | null>
  addMember(
    groupId: number,
    accountId: number,
    role?: GROUPMEMBERROLE
  ): Promise<GroupMembers>
  removeMember(groupId: number, accountId: number): Promise<boolean>
}
