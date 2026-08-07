import { NextFunction, Request, Response } from 'express'
import { ROLENAME } from '~/entities/roles.entity'
import { Forbidden, NotFound } from '~/error/error.custom'

export interface OwnershipOptions<T> {
  /** Nạp tài nguyên từ request (thường theo req.params.id) */
  load: (req: Request) => Promise<T | null>
  /** Rút ra id tài khoản sở hữu tài nguyên đó */
  ownerOf: (resource: T) => number | null | undefined
  /** Role được bỏ qua kiểm tra sở hữu — mặc định chỉ ADMIN */
  bypassRoles?: string[]
  /** Gắn tài nguyên đã nạp vào res.locals để handler dùng lại, khỏi query 2 lần */
  attachAs?: string
}

/**
 * Tầng 2 của phân quyền: "được phép làm lên ĐÚNG tài nguyên này không?"
 *
 * Đây chính là tầng mà RBAC phẳng không diễn tả được. Trong mạng xã hội phần
 * lớn quyền không phụ thuộc "bạn là ai" mà phụ thuộc "bạn là gì đối với tài
 * nguyên này": chủ post, chủ nhóm, chủ quảng cáo.
 *
 * Lưu ý: danh tính so sánh LUÔN lấy từ req.user (tức từ token), không bao giờ
 * lấy từ body/params — nếu không thì kẻ tấn công chỉ cần gửi id của nạn nhân
 * là qua được toàn bộ kiểm tra này.
 */
export function requireOwnership<T>(options: OwnershipOptions<T>) {
  const bypassRoles = options.bypassRoles ?? [ROLENAME.ADMIN]

  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Forbidden('Chưa xác thực')
      }

      const roles = req.user.roles ?? []
      if (roles.some((role) => bypassRoles.includes(role))) {
        next()
        return
      }

      const resource = await options.load(req)
      if (!resource) {
        throw new NotFound('Không tìm thấy tài nguyên')
      }

      const ownerId = options.ownerOf(resource)
      if (ownerId == null || Number(ownerId) !== Number(req.user.id)) {
        throw new Forbidden('Bạn không sở hữu tài nguyên này')
      }

      if (options.attachAs) {
        res.locals[options.attachAs] = resource
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
