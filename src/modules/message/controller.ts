import IMessageService from "~/modules/message/services/IMessageService";
import { Request, Response } from "express";
import { CreateMessageInputDTO } from "~/modules/message/dto/CreateMessageDTO";

import cloudinary from "~/config/cloudinary";
import { ChangeStatusMessageInputDTO } from "~/modules/message/dto/Update";
import { MESSAGESTATUS } from "~/entities/messages.entity";
import { ApiResponse, sendResponse } from "~/response/api.response";
import { httpStatusCode } from "~/global/httpStatusCode";
import { GetListMessageInputDTO } from "~/modules/message/dto/Get";

export class MessageController {
  constructor(private service: IMessageService) {
    this.service = service;
  }
  async getListMessage(req: Request, res: Response) {
    const { id } = req.params;
    const { targetId } = req.query;
    console.log(id, targetId);
    const inputDTO = new GetListMessageInputDTO({
      senderId: Number(id),
      receiverId: Number(targetId),
    });
    const response = await this.service.getListMessage(inputDTO);
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.OK,
        message: "Get list message successfully",
      }),
    );
  }
  async getDetail(req: Request, res: Response) {
    const { id } = req.params;
    const response = await this.service.getDetail(Number(id));
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.OK,
        message: "Get detail message successfully",
      }),
    );
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const inputDTO = new ChangeStatusMessageInputDTO(
      Number(id),
      status as MESSAGESTATUS,
    );
    const response = await this.service.changeStatus(inputDTO);
    sendResponse(
      new ApiResponse({
        res: res,
        data: response,
        statusCode: httpStatusCode.OK,
        message: "Update message successfully",
      }),
    );
  }
  async createMessage(req: Request, res: Response) {
    const image = req.file as Express.Multer.File;
    let uploadedImage;

    if (image?.path) {
      uploadedImage = await cloudinary.uploader.upload(image.path);
    }

    const dto = new CreateMessageInputDTO({
      content: req.body.content ?? "",
      senderId: req.user.id,
      receiverId: req.body.receiverId,
      imageUrl: uploadedImage?.secure_url ?? "",
    });

    const response = await this.service.createMessage(dto);
    const receiverRoom = `user_${dto.receiverId}`;
    console.log("receiverRoom", receiverRoom);
    res.io.to(receiverRoom).emit("chat messsage", {
      message: response,
      from: dto.senderId,
    });
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.CREATED,
        message: "Create message successfully",
      }),
    );
  }
}
