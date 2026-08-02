import { Router } from "express";
import { upload } from "~/config/multerConfig";
import { verifyToken } from "~/middlewares/verifyToken";
import AccountRepoImpl from "~/modules/account/repositories/AccountRepoImpl";
import GroupRepoImpl from "~/modules/group/repositories/GroupRepoImpl";
import { PostController } from "~/modules/post/controller";
import PostRepoImpl from "~/modules/post/repositories/PostRepoImpl";
import PostServiceImpl from "~/modules/post/services/PostServiceImpl";
import PostLikeRepoImpl from "~/modules/postLike/repositories/PostLikeRepoImpl";
import { PostMediaRepositoriesImpl } from "~/modules/postMedia/repositories/PostMediaRepositoriesImpl";
import { asyncHandler } from "~/utils/asyncHandler";

export const postRouter = Router();

const postRepo = new PostRepoImpl();
const accountRepo = new AccountRepoImpl();
const groupRepo = new GroupRepoImpl();
const postMediaRepo = new PostMediaRepositoriesImpl();
const postLikesRepo = new PostLikeRepoImpl();
const service = new PostServiceImpl(
  postRepo,
  accountRepo,
  groupRepo,
  postMediaRepo,
  postLikesRepo,
);
const controller = new PostController(service);

postRouter.get(
  "/suggest",
  asyncHandler(controller.getSuggestList.bind(controller)),
);
postRouter.get("/", asyncHandler(controller.getAll.bind(controller)));
postRouter.get("/:id", asyncHandler(controller.getById.bind(controller)));
postRouter.get(
  "/accounts/:id",
  asyncHandler(controller.getByAccountId.bind(controller)),
);
postRouter.post(
  "/",
  asyncHandler(verifyToken()),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 5 },
  ]),
  asyncHandler(controller.create.bind(controller)),
);

postRouter.delete(
  "/:id",
  asyncHandler(verifyToken()),
  asyncHandler(controller.delete.bind(controller)),
);

postRouter.post(
  "/like",
  asyncHandler(verifyToken()),
  asyncHandler(controller.like.bind(controller)),
);
postRouter.post(
  "/unlike",
  asyncHandler(verifyToken()),
  asyncHandler(controller.unlike.bind(controller)),
);
postRouter.put(
  "/:postId",
  asyncHandler(verifyToken()),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 5 },
  ]),
  asyncHandler(controller.update.bind(controller)),
);
