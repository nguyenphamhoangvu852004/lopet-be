import IGroupService from '~/modules/group/services/IGroupService'
import { Request, Response } from 'express'
import { handleControllerError } from '~/utils/handle.util'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'
import { CreateGroupInputDTO } from '~/modules/group/dto/Create'
import { AddMemberInputDTO } from '~/modules/group/dto/AddMember'
import { DeleteGroupInputDTO } from '~/modules/group/dto/DeleteGroup'
import { RemoveMemberInputDTO } from '~/modules/group/dto/DeleteMember'
import { GetListSuggestGroupInputDTO } from '~/modules/group/dto/GetListSuggest'

export class GroupController {
  constructor(private service: IGroupService) {
    this.service = service
  }

  async create(req: Request, res: Response) {
    try {
      const { name, type, owner } = req.body

      const dto = new CreateGroupInputDTO({
        name: name,
        type: type,
        owner: owner
      })

      const response = await this.service.createGroup(dto)
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.CREATED,
          message: 'Create group successfully',
          data: response
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async addMember(req: Request, res: Response) {
    try {
      const { groupId, owner, invitee } = req.body
      const dto = new AddMemberInputDTO({
        groupId: groupId,
        owner: owner,
        invitee: invitee
      })

      const repsonse = await this.service.addMember(dto)
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.CREATED,
          message: 'Add member successfully',
          data: repsonse
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const response = await this.service.getById(Number(id))
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get group successfully',
          data: response
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async removeMember(req: Request, res: Response) {
    try {
      const { groupId, owner, member } = req.body
      const response = await this.service.removeMember(
        new RemoveMemberInputDTO({
          groupId: groupId,
          owner: owner,
          member: member
        })
      )
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Remove member successfully',
          data: response
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async deleteGroup(req: Request, res: Response) {
    try {
      const { owner, groupId } = req.body
      const response = await this.service.deleteGroup(
        new DeleteGroupInputDTO({
          groupId: groupId,
          owner: owner
        })
      )
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Delete group successfully',
          data: response
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async getListOwned(req: Request, res: Response) {
    try {
      const { id } = req.params
      const list = await this.service.getListOwnedGroup(Number(id))
      sendResponse(
        new ApiResponse({
          res: res,
          data: list,
          statusCode: httpStatusCode.OK,
          message: ' Get group successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async getListJoined(req: Request, res: Response) {
    try {
      const { id } = req.params
      const list = await this.service.getListJoinedGroup(Number(id))
      sendResponse(
        new ApiResponse({
          res: res,
          data: list,
          statusCode: httpStatusCode.OK,
          message: ' Get group successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async getListSuggest(req: Request, res: Response) {
    try {
      const response = await this.service.getListSuggestGroup()
      sendResponse(
        new ApiResponse({
          res: res,
          data: response,
          statusCode: httpStatusCode.OK,
          message: ' Get group successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
}
