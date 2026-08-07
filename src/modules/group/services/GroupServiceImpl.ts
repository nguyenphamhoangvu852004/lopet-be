import { Accounts } from '~/entities/accounts.entity'
import { GROUPMEMBERROLE } from '~/entities/groupMembers.entity'
import { Groups } from '~/entities/groups.entity'
import { BadRequest, Forbidden } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import {
  AddMemberInputDTO,
  AddMemberOutputDTO
} from '~/modules/group/dto/AddMember'
import {
  CreateGroupInputDTO,
  CreateGroupOutputDTO
} from '~/modules/group/dto/Create'
import {
  DeleteGroupInputDTO,
  DeleteGroupOutputDTO
} from '~/modules/group/dto/DeleteGroup'
import {
  RemoveMemberInputDTO,
  RemoveMemberOutputDTO
} from '~/modules/group/dto/DeleteMember'
import { GetListJoinedOutputDTO } from '~/modules/group/dto/GeListJoined'
import { GetListOwnedOutputDTO } from '~/modules/group/dto/GetListOwned'
import { GetListSuggestGroupOutputDTO } from '~/modules/group/dto/GetListSuggest'
import {
  ModifyGroupInputDTO,
  ModifyGroupOutputDTO
} from '~/modules/group/dto/ModifyGroup'
import IGroupRepo from '~/modules/group/repositories/IGroupRepo'
import IGroupService from '~/modules/group/services/IGroupService'

export default class GroupServiceImpl implements IGroupService {
  constructor(
    private groupRepo: IGroupRepo,
    private accountRepo: IAccountRepo
  ) {
    this.groupRepo = groupRepo
    this.accountRepo = accountRepo
  }

  /** Chủ group giờ là bản ghi group_members có role = OWNER */
  private ownerIdOf(group: Groups): number {
    const owner = group.members?.find(
      (member) => member.role === GROUPMEMBERROLE.OWNER
    )
    return owner?.accountId ?? 0
  }

  async createGroup(data: CreateGroupInputDTO): Promise<CreateGroupOutputDTO> {
    const account = await this.accountRepo.findById(data.owner)
    if (!account) throw new BadRequest()
    const newEntity = new Groups({
      name: data.name,
      type: data.type,
      bio: data.bio ?? '',
      coverUrl: data.coverUrl ?? ''
    })
    const response: Groups | null = await this.groupRepo.create(newEntity)
    if (!response) throw new BadRequest()

    // Người tạo trở thành OWNER trong group_members thay vì cột groups.owner cũ
    await this.groupRepo.addMember(
      response.id,
      account.id,
      GROUPMEMBERROLE.OWNER
    )

    return new CreateGroupOutputDTO({
      id: response.id,
      name: response.name,
      type: response.type,
      owner: account.id,
      bio: response.bio,
      coverUrl: response.coverUrl,
      createdAt: response.createdAt
    })
  }

  async addMember(data: AddMemberInputDTO): Promise<AddMemberOutputDTO> {
    if (!(await this.groupRepo.canManage(data.groupId, data.owner))) {
      throw new Forbidden('Bạn không có quyền quản trị nhóm này')
    }
    const invitee: Accounts | null = await this.accountRepo.findById(
      data.invitee
    )
    const group: Groups | null = await this.groupRepo.findById(data.groupId)
    if (!invitee || !group) throw new BadRequest()

    const existed = await this.groupRepo.findMember(data.groupId, invitee.id)
    if (existed) throw new BadRequest('Thành viên đã ở trong nhóm')

    await this.groupRepo.addMember(
      data.groupId,
      invitee.id,
      GROUPMEMBERROLE.MEMBER
    )
    return new AddMemberOutputDTO({
      groupId: group.id,
      invitee: invitee.id
    })
  }

  async getListOwnedGroup(data: number): Promise<GetListOwnedOutputDTO[]> {
    const response: Groups[] = await this.groupRepo.getListOwned(data)
    const listDto: GetListOwnedOutputDTO[] = []
    for (const group of response) {
      const dto = new GetListOwnedOutputDTO({
        id: group.id,
        name: group.name,
        ownerId: this.ownerIdOf(group),
        type: group.type,
        bio: group.bio,
        coverUrl: group.coverUrl,
        createdAt: group.createdAt
      })
      dto.totalMembers = group.members.length
      listDto.push(dto)
    }
    return listDto
  }

  async getListJoinedGroup(data: number): Promise<GetListJoinedOutputDTO[]> {
    const response = await this.groupRepo.getListJoined(data)
    const listDto: GetListJoinedOutputDTO[] = []
    for (const group of response) {
      const dto = new GetListJoinedOutputDTO({
        id: group.id,
        name: group.name,
        ownerId: this.ownerIdOf(group),
        type: group.type,
        bio: group.bio,
        coverUrl: group.coverUrl,
        createdAt: group.createdAt
      })
      dto.totalMembers = group.members.length
      listDto.push(dto)
    }
    return listDto
  }

  async getListSuggestGroup(): Promise<GetListSuggestGroupOutputDTO[]> {
    const repsonse = await this.groupRepo.getListSuggest()
    const listDto: GetListSuggestGroupOutputDTO[] = []
    for (const group of repsonse) {
      const dto = new GetListJoinedOutputDTO({
        id: group.id,
        name: group.name,
        ownerId: this.ownerIdOf(group),
        type: group.type,
        bio: group.bio,
        coverUrl: group.coverUrl,
        createdAt: group.createdAt
      })
      dto.totalMembers = group.members.length
      listDto.push(dto)
    }
    return listDto
  }

  async modifyGroup(data: ModifyGroupInputDTO): Promise<ModifyGroupOutputDTO> {
    if (!(await this.groupRepo.canManage(data.id, data.owner))) {
      throw new Forbidden('Bạn không có quyền quản trị nhóm này')
    }
    const group: Groups | null = await this.groupRepo.findById(data.id)
    if (!group) throw new BadRequest()
    group.name = data.name ?? group.name
    group.type = data.type ?? group.type
    group.bio = data.bio ?? group.bio
    group.coverUrl = data.image ?? group.coverUrl
    const response = await this.groupRepo.update(group)
    if (!response) throw new BadRequest()
    return new ModifyGroupOutputDTO({
      id: response.id,
      success: true
    })
  }

  async deleteGroup(data: DeleteGroupInputDTO): Promise<DeleteGroupOutputDTO> {
    // Xoá group là hành động huỷ diệt nên yêu cầu đúng OWNER, ADMIN nhóm không đủ
    if (!(await this.groupRepo.isOwned(data.groupId, data.owner))) {
      throw new Forbidden('Chỉ chủ nhóm mới được xoá nhóm')
    }
    const response = await this.groupRepo.delete(data.groupId)
    if (!response) throw new BadRequest()
    return new DeleteGroupOutputDTO({ groupId: response.id })
  }

  async getById(data: number): Promise<Groups> {
    const response = await this.groupRepo.findById(data)
    if (!response) throw new BadRequest()
    return response
  }

  async removeMember(
    data: RemoveMemberInputDTO
  ): Promise<RemoveMemberOutputDTO> {
    if (!(await this.groupRepo.canManage(data.groupId, data.owner))) {
      throw new Forbidden('Bạn không có quyền quản trị nhóm này')
    }
    const target = await this.groupRepo.findMember(data.groupId, data.member)
    if (!target) throw new BadRequest('Người này không phải thành viên nhóm')
    if (target.role === GROUPMEMBERROLE.OWNER) {
      throw new BadRequest('Không thể xoá chủ nhóm khỏi nhóm')
    }

    await this.groupRepo.removeMember(data.groupId, data.member)
    return new RemoveMemberOutputDTO({
      groupId: data.groupId,
      member: data.member
    })
  }
}
