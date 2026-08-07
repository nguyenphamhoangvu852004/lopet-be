import { NextFunction, Request, Response } from 'express'
import { Forbidden } from '~/error/error.custom'
import IFriendShipRepositories from '~/modules/friendShip/repositories/IFriendShipRepositories'

/**
 * Quyền riêng tư theo quan hệ: chỉ chính chủ hoặc bạn bè (ACCEPTED) của tài
 * khoản trong `:id` mới được xem.
 *
 * Đây là dạng quyền mà cả RBAC lẫn requireOwnership đều không diễn tả được:
 * không phải "bạn là ai", cũng không phải "bạn có sở hữu cái này không", mà là
 * "bạn có quan hệ gì với chủ tài nguyên". Phải tra chính bảng friend_ships mới
 * trả lời được.
 *
 * ADMIN không được bỏ qua: danh sách bạn bè là dữ liệu riêng tư, không phải
 * thứ kiểm duyệt viên tự ý xem. Vi phạm thì đi qua luồng báo cáo.
 */
export function requireFriendOrSelf(
  friendShipRepo: IFriendShipRepositories,
  paramName = 'id'
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Forbidden('Chưa xác thực')

      const targetId = Number(req.params[paramName])
      const callerId = Number(req.user.id)

      if (Number.isNaN(targetId)) {
        throw new Forbidden('Tham số không hợp lệ')
      }
      if (targetId === callerId) {
        next()
        return
      }

      const isFriend = await friendShipRepo.areFriends(callerId, targetId)
      if (!isFriend) {
        throw new Forbidden(
          'Chỉ bạn bè mới xem được danh sách bạn bè của tài khoản này'
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
