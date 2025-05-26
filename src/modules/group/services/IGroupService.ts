import { Groups } from '~/entities/groups.entity'
import { AddMemberInputDTO, AddMemberOutputDTO } from '~/modules/group/dto/AddMember'
import { CreateGroupInputDTO, CreateGroupOutputDTO } from '~/modules/group/dto/Create'
import { DeleteGroupInputDTO, DeleteGroupOutputDTO } from '~/modules/group/dto/DeleteGroup'
import { RemoveMemberInputDTO, RemoveMemberOutputDTO } from '~/modules/group/dto/DeleteMember'
import { GetListJoinedOutputDTO } from '~/modules/group/dto/GeListJoined'
import { GetListOwnedOutputDTO } from '~/modules/group/dto/GetListOwned'
import { GetListSuggestGroupOutputDTO } from '~/modules/group/dto/GetListSuggest'
import { ModifyGroupInputDTO, ModifyGroupOutputDTO } from '~/modules/group/dto/ModifyGroup'

export default interface IGroupService {
  createGroup(data: CreateGroupInputDTO): Promise<CreateGroupOutputDTO>
  addMember(data: AddMemberInputDTO): Promise<AddMemberOutputDTO>
  removeMember(data: RemoveMemberInputDTO): Promise<RemoveMemberOutputDTO>
  getById(data: number): Promise<Groups>
  getListOwnedGroup(data: number): Promise<GetListOwnedOutputDTO[]>
  getListJoinedGroup(data: number): Promise<GetListJoinedOutputDTO[]>
  getListSuggestGroup(): Promise<GetListSuggestGroupOutputDTO[]>
  modifyGroup(data: ModifyGroupInputDTO): Promise<ModifyGroupOutputDTO>
  deleteGroup(data: DeleteGroupInputDTO): Promise<DeleteGroupOutputDTO>
}
