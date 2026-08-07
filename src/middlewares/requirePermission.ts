import { NextFunction, Request, Response } from 'express'
import { hasPermission, resolvePermissions } from '~/authz/permission.catalog'
import { Forbidden } from '~/error/error.custom'

/**
 * Tầng 1 của phân quyền: "hành động này có được phép không?"
 *
 * Thay cho verifyRole() cũ vốn hỏi "anh có phải ADMIN không" — câu hỏi sai
 * altitude khiến mỗi lần thêm role là phải sửa tay hàng loạt file route.
 *
 * Phải đặt SAU verifyToken(). Nếu tài nguyên có chủ sở hữu thì còn phải qua
 * tiếp requireOwnership() nữa — permission không thay thế được ownership.
 */
export function requirePermission(...required: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      next(new Forbidden('Chưa xác thực'))
      return
    }

    const granted = resolvePermissions(req.user.roles ?? [])
    const ok = required.some((permission) => hasPermission(granted, permission))

    if (!ok) {
      next(new Forbidden(`Thiếu quyền: ${required.join(' hoặc ')}`))
      return
    }

    next()
  }
}
