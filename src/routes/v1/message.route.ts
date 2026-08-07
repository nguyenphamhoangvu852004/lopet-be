import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { Messages } from '~/entities/messages.entity'
import { requireOwnership } from '~/middlewares/requireOwnership'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { MessageController } from '~/modules/message/controller'
import { MessageRepoImpl } from '~/modules/message/repositories/MessageRepoImpl'
import MessageServiceImpl from '~/modules/message/services/MessageServiceImpl'
import ProfileRepoImpl from '~/modules/profile/repositories/ProfileRepoImpl'
import { asyncHandler } from '~/utils/asyncHandler'

export const messageRouter = Router()

const messageRepo = new MessageRepoImpl()
const accountRepo = new AccountRepoImpl()
const profileRepo = new ProfileRepoImpl()
const service = new MessageServiceImpl(messageRepo, accountRepo, profileRepo)
const controller = new MessageController(service)

/**
 * Tin nhắn không có "một chủ sở hữu": cả người gửi lẫn người nhận đều là bên
 * hợp lệ, nên ownerOf trả về mảng hai id.
 *
 * ADMIN cũng KHÔNG được bỏ qua — nội dung tin nhắn riêng tư không phải thứ
 * kiểm duyệt viên tự ý đọc được. Muốn xử lý vi phạm thì đi qua luồng báo cáo.
 */
const mustBeParticipant = requireOwnership<Messages>({
  load: (req) => messageRepo.findById(Number(req.params.id)),
  ownerOf: (message) =>
    [message.sender?.id, message.receiver?.id].filter(
      (id): id is number => id != null
    ),
  bypassRoles: []
})

/**
 * Trước đây hai route dưới đây chỉ có verifyToken và service cũng không đối
 * chiếu người gọi: bất kỳ ai đăng nhập cũng đọc được nội dung tin nhắn riêng
 * tư của người khác chỉ bằng cách đoán id, và đổi được cả trạng thái của nó.
 */
messageRouter.get(
  '/:id',
  asyncHandler(verifyToken()),
  mustBeParticipant,
  asyncHandler(controller.getDetail.bind(controller))
)

messageRouter.patch(
  '/status/:id',
  asyncHandler(verifyToken()),
  mustBeParticipant,
  asyncHandler(controller.updateStatus.bind(controller))
)

// senderId lấy từ token trong controller
messageRouter.get(
  '/me/:id',
  asyncHandler(verifyToken()),
  asyncHandler(controller.getListMessage.bind(controller))
)

messageRouter.post(
  '/',
  asyncHandler(verifyToken()),
  upload.single('image'),
  asyncHandler(controller.createMessage.bind(controller))
)
