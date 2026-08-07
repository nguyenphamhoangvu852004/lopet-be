import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { environment } from '~/config/env'
import { BadRequest } from '~/error/error.custom'
import { UserPayload } from '~/utils/jwt.util'

export function verifyToken() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.header('Authorization')?.split(' ')[1]
      if (!token) {
        throw new BadRequest('Token not found')
      }

      const decoded = jwt.verify(
        token,
        environment.ACCESS_TOKEN_SECRET as string
      )
      if (typeof decoded == 'string') {
        throw new BadRequest('Token not found')
      }

      const userPayload: UserPayload = {
        id: decoded.id,
        email: decoded.email,
        // Trước đây gán cứng [] nên mọi kiểm tra quyền ở tầng trên đều mất dữ liệu.
        // Token đã mang sẵn roles (xem jwt.util.ts), chỉ cần đọc lại cho đúng.
        roles: Array.isArray(decoded.roles) ? decoded.roles : []
      }
      req.user = userPayload

      next()
    } catch (error) {
      next(error)
    }
  }
}
