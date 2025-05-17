import { response } from 'express'
import { logger } from '~/config/logger'
import { Accounts } from '~/entities/accounts.entity'
import { Groups } from '~/entities/groups.entity'
import { BadRequest } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { AddMemberInputDTO, AddMemberOutputDTO } from '~/modules/group/dto/AddMember'
import { CreateGroupInputDTO, CreateGroupOutputDTO } from '~/modules/group/dto/Create'
import { DeleteGroupInputDTO, DeleteGroupOutputDTO } from '~/modules/group/dto/DeleteGroup'
import { RemoveMemberInputDTO, RemoveMemberOutputDTO } from '~/modules/group/dto/DeleteMember'
import { ModifyGroupInputDTO, ModifyGroupOutputDTO } from '~/modules/group/dto/ModifyGroup'
import IGroupRepo from '~/modules/group/repositories/IGroupRepo'
import IGroupService from '~/modules/group/services/IGroupService'
import { handleThrowError } from '~/utils/handle.util'

export default class GroupServiceImpl implements IGroupService {
  constructor(
    private groupRepo: IGroupRepo,
    private accountRepo: IAccountRepo
  ) {
    this.groupRepo = groupRepo
    this.accountRepo = accountRepo
  }
  async createGroup(data: CreateGroupInputDTO): Promise<CreateGroupOutputDTO> {
    try {
      const account = await this.accountRepo.findById(data.owner)
      if (!account) throw new BadRequest()
      const newEntity = new Groups({
        name: data.name,
        type: data.type,
        owner: account
      })
      const response: Groups | null = await this.groupRepo.create(newEntity)
      if (!response) throw new BadRequest()
      return new CreateGroupOutputDTO({
        id: response.id,
        name: response.name,
        type: response.type,
        owner: response.owner.id,
        createdAt: response.createdAt
      })
    } catch (error) {
      handleThrowError(error)
    }
  }

  async addMember(data: AddMemberInputDTO): Promise<AddMemberOutputDTO> {
    try {
      if (!(await this.groupRepo.isOwned(data.groupId, data.owner))) {
        throw new BadRequest()
      }
      const invitee: Accounts | null = await this.accountRepo.findById(data.invitee)
      const group: Groups | null = await this.groupRepo.findById(data.groupId)
      logger.info(group)
      if (!invitee || !group) throw new BadRequest()
      group.members.push(invitee)
      const response: Groups | null = await this.groupRepo.update(group)
      if (!response) throw new BadRequest()
      return new AddMemberOutputDTO({
        groupId: response.id,
        invitee: invitee.id
      })
    } catch (error) {
      handleThrowError(error)
    }
  }
  async getListOwnedGroup(data: number): Promise<Groups[]> {
    try {
      const response = await this.groupRepo.getListOwned(data)
      return response
    } catch (error) {
      handleThrowError(error)
    }
  }
  async getListJoinedGroup(data: number): Promise<Groups[]> {
    try {
      const response = await this.groupRepo.getListJoined(data)
      return response
    } catch (error) {
      handleThrowError(error)
    }
  }

  async getListSuggestGroup(): Promise<Groups[]> {
    try {
      const repsonse = await this.groupRepo.getListSuggest()
      return repsonse
    } catch (error) {
      handleThrowError(error)
    }
  }
  async modifyGroup(data: ModifyGroupInputDTO): Promise<ModifyGroupOutputDTO> {
    throw new Error('Method not implemented.')
  }
  async deleteGroup(data: DeleteGroupInputDTO): Promise<DeleteGroupOutputDTO> {
    try {
      if (!(await this.groupRepo.isOwned(data.groupId, data.owner))) {
        throw new BadRequest()
      }
      const response = await this.groupRepo.delete(data.groupId)
      if (!response) throw new BadRequest()
      return new DeleteGroupOutputDTO({ groupId: response.id })
    } catch (error) {
      handleThrowError(error)
    }
  }

  async getById(data: number): Promise<Groups> {
    try {
      const response = await this.groupRepo.findById(data)
      if (!response) throw new BadRequest()
      return response
    } catch (error) {
      handleThrowError(error)
    }
  }

  async removeMember(data: RemoveMemberInputDTO): Promise<RemoveMemberOutputDTO> {
    try {
      if (!(await this.groupRepo.isOwned(data.groupId, data.owner))) {
        throw new BadRequest()
      }
      const member = await this.accountRepo.findById(data.member)
      if (!member) throw new BadRequest()
      const group = await this.groupRepo.findById(data.groupId)
      if (!group) throw new BadRequest()
      group.members = group.members.filter((item) => item.id !== member.id)
      const response = await this.groupRepo.update(group)
      if (!response) throw new BadRequest()

      return new RemoveMemberOutputDTO({ groupId: response.id, member: member.id })
    } catch (error) {
      handleThrowError(error)
    }
  }
}
