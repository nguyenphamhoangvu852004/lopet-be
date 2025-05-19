import { Groups } from '~/entities/groups.entity'

export default interface IGroupRepo {
  create(data: Groups): Promise<Groups | null>
  findById(id: number): Promise<Groups | null>
  getListSuggest(): Promise<Groups[]>
  getListOwned(data: number): Promise<Groups[]>
  getListJoined(data: number): Promise<Groups[]>
  update(data: Groups): Promise<Groups | null>
  delete(data: number): Promise<Groups | null>
  isOwned(groupId: number, accountId: number): Promise<boolean>
}
