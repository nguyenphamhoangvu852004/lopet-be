import IPostService from "~/modules/post/services/IPostService";
import { Request, Response } from "express";

import {
  CreatePostInputDTO,
  PostMediaInputDTO,
} from "~/modules/post/dto/Create";
import { ApiResponse, sendResponse } from "~/response/api.response";
import { httpStatusCode } from "~/global/httpStatusCode";
import cloudinary from "~/config/cloudinary";
import { logger } from "~/config/logger";
import { MEDIATYPE } from "~/entities/postMedias.entity";
import { LikePostInputDTO, UnlikePostInputDTO } from "~/modules/post/dto/React";
import { GetPostListInputDTO } from "~/modules/post/dto/Get";
import { UpdatePostInputDTO } from "~/modules/post/dto/Update";

export class PostController {
  constructor(private postService: IPostService) {
    this.postService = postService;
  }
  async update(req: Request, res: Response) {
    const { postId } = req.params;
    const data = req.body;
    const files = req.files as {
      images?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    };

    const uploadedMedias: PostMediaInputDTO[] = [];

    // Upload images
    if (files?.images?.length) {
      for (const image of files.images) {
        const rs = await cloudinary.uploader.upload(image.path, {
          resource_type: "image",
        });
        uploadedMedias.push(
          new PostMediaInputDTO({
            mediaUrl: rs.secure_url,
            mediaType: MEDIATYPE.IMAGE,
          }),
        );
      }
    }

    // Upload videos
    if (files?.videos?.length) {
      for (const video of files.videos) {
        const rs = await cloudinary.uploader.upload(video.path, {
          resource_type: "video",
        });
        uploadedMedias.push(
          new PostMediaInputDTO({
            mediaUrl: rs.secure_url,
            mediaType: MEDIATYPE.VIDEO,
          }),
        );
      }
    }

    const oldIdsMedia: number[] = [];
    if (data.oldIdsMedia) {
      if (Array.isArray(data.oldIdsMedia)) {
        oldIdsMedia.push(...data.oldIdsMedia.map(Number));
      } else {
        oldIdsMedia.push(Number(data.oldIdsMedia));
      }
    }

    const dto = new UpdatePostInputDTO({
      postId: Number(postId),
      owner: req.user.id,
      oldIdsMedia,
      content: data.content,
      postMedias: uploadedMedias,
      // Scope được kiểm ở service (postPolicy.parseScope), nơi biết group THẬT
      // của bài. Kiểm ở đây thì chỉ có groupId trong body để dựa vào — mà đó
      // đúng là thứ client tự khai và có thể bỏ trống để lách.
      scope: data.scope,
    });

    const response = await this.postService.update(dto);

    return sendResponse(
      new ApiResponse({
        res,
        statusCode: httpStatusCode.OK,
        message: "Update post successfully",
        data: response,
      }),
    );
  }

  /**
   * Bốn hàm đọc dưới đây chạy sau optionalAuth: req.user có thể không tồn tại
   * (khách vãng lai). Danh tính người xem được đẩy xuống tới tận repo để lọc
   * theo postScope — không được lọc ở tầng này sau khi đã nạp hết bài về.
   */
  async getSuggestList(req: Request, res: Response) {
    const response = await this.postService.getSuggestList(req.user?.id);
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.OK,
        message: "Get suggest posts successfully",
      }),
    );
  }
  async getAll(req: Request, res: Response) {
    const content = req.query.content;
    const safeContent =
      content && content !== "undefined" ? String(content) : undefined;

    const groupId = req.query.groupId;
    const safeGroupId =
      groupId && groupId !== "undefined" ? Number(groupId) : undefined;

    const dto = new GetPostListInputDTO({
      content: safeContent,
      groupId: safeGroupId,
      viewerId: req.user?.id,
    });
    const response = await this.postService.getAll(dto);
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.OK,
        message: "Get posts successfully",
      }),
    );
  }
  async getById(req: Request, res: Response) {
    const response = await this.postService.getOneById(
      Number(req.params.id),
      req.user?.id,
    );
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.OK,
        message: "Get post successfully",
      }),
    );
  }
  async getByAccountId(req: Request, res: Response) {
    const response = await this.postService.getByAccountId(
      Number(req.params.id),
      req.user?.id,
    );
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.OK,
        message: `Get list by account id ${req.params.id} successfully`,
      }),
    );
  }
  async create(req: Request, res: Response) {
    const data = req.body;
    const files = req.files as {
      images?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    };
    const images: PostMediaInputDTO[] = [];
    const videos: PostMediaInputDTO[] = [];

    if (files.images) {
      for (const image of files.images) {
        const rs = await cloudinary.uploader.upload(image.path, {
          resource_type: "image",
        });
        const imageDTO = new PostMediaInputDTO({
          mediaUrl: rs.secure_url,
          mediaType:
            rs.resource_type == "image" ? MEDIATYPE.IMAGE : MEDIATYPE.VIDEO,
        });
        images.push(imageDTO);
        logger.info(image);
      }
    }

    if (files.videos) {
      for (const video in files.videos) {
        const rs = await cloudinary.uploader.upload(files.videos[video].path, {
          resource_type: "video",
        });
        const videoDTO = new PostMediaInputDTO({
          mediaUrl: rs.secure_url,
          mediaType:
            rs.resource_type == "image" ? MEDIATYPE.IMAGE : MEDIATYPE.VIDEO,
        });
        videos.push(videoDTO);
        logger.info(video);
      }
    }

    const dto = new CreatePostInputDTO({
      accountId: req.user.id,
      content: data.content,
      groupId: data.groupId ?? null, // nếu như groupId có giá trị thì cái loại bài viết này nó là bài viết GROUP, còn không thì nó là bài của USER
      postMedias: [...images, ...videos],
      // Cả tính hợp lệ của scope lẫn quyền đăng vào group đều do service quyết
      // (postPolicy). Controller không tự kiểm: nó chỉ thấy body, còn quyết định
      // phụ thuộc group.type và tư cách thành viên — dữ liệu chỉ có ở tầng dưới.
      scope: data.scope,
    });

    const response = await this.postService.create(new CreatePostInputDTO(dto));
    sendResponse(
      new ApiResponse({
        res: res,
        statusCode: httpStatusCode.CREATED,
        message: "Create post successfully",
        data: response,
      }),
    );
  }
  async delete(req: Request, res: Response) {
    const response = await this.postService.delete(Number(req.params.id));
    sendResponse(
      new ApiResponse({
        res: res,
        statusCode: httpStatusCode.OK,
        message: "Delete post successfully",
        data: response,
      }),
    );
  }
  async like(req: Request, res: Response) {
    const { postId } = req.body;
    const dto = new LikePostInputDTO({
      accountId: req.user.id,
      postId: postId,
    });
    const response = await this.postService.like(dto);
    sendResponse(
      new ApiResponse({
        res: res,
        statusCode: httpStatusCode.OK,
        message: "Like post successfully",
        data: response,
      }),
    );
  }

  async unlike(req: Request, res: Response) {
    const { postId } = req.body;
    const dto = new UnlikePostInputDTO({
      accountId: req.user.id,
      postId: postId,
    });
    const response = await this.postService.unLike(dto);
    sendResponse(
      new ApiResponse({
        res: res,
        statusCode: httpStatusCode.OK,
        message: "Unlike post successfully",
        data: response,
      }),
    );
  }
}
