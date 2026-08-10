import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { environment } from '~/config/env'
import { Unauthorized } from '~/error/error.custom'
import { UserPayload } from '~/utils/jwt.util'

/**
 * Xác thực "mềm" cho các route ĐỌC vốn đang mở cho khách vãng lai.
 *
 * Các route đọc bài viết trước giờ không có verifyToken, nên không biết người
 * gọi là ai và cũng không thể lọc theo quyền riêng tư. Bắt buộc đăng nhập thì
 * chặn mất luồng xem công khai mà frontend đang dùng; vì vậy ở đây tách ba
 * trường hợp:
 *
 *   - Không gửi token       -> đi tiếp như KHÁCH (req.user không được gán),
 *                              tầng dưới chỉ trả nội dung công khai.
 *   - Token hợp lệ          -> gán req.user, tầng dưới mở thêm bài của chính
 *                              mình, của bạn bè và của nhóm mình tham gia.
 *   - Token có nhưng hỏng   -> 401. Cố tình KHÔNG âm thầm hạ xuống thành khách:
 *                              làm vậy thì token hết hạn sẽ khiến feed lặng lẽ
 *                              mất bài thay vì báo cho client đi đăng nhập lại,
 *                              một lỗi rất khó lần ra.
 */
export function optionalAuth() {
  return function (req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization')?.split(' ')[1]

    // Khách vãng lai — hợp lệ, đi tiếp mà không có danh tính
    if (!token) {
      next()
      return
    }

    try {
      const decoded = jwt.verify(
        token,
        environment.ACCESS_TOKEN_SECRET as string
      )
      if (typeof decoded === 'string') {
        throw new Unauthorized('Token không hợp lệ')
      }

      const userPayload: UserPayload = {
        id: decoded.id,
        email: decoded.email,
        roles: Array.isArray(decoded.roles) ? decoded.roles : []
      }
      req.user = userPayload
      next()
    } catch (error) {
      // Chuẩn hoá lỗi của thư viện jwt về đúng 401 thay vì để lọt xuống
      // globalExceptionMiddleware, nơi error.code không phải số sẽ thành 500.
      if (error instanceof jwt.JsonWebTokenError) {
        next(new Unauthorized('Token không hợp lệ hoặc đã hết hạn'))
        return
      }
      next(error)
    }
  }
}
