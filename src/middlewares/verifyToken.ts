import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { log } from 'console'
import { environment } from '~/config/env'

export function verifyToken() {
  return async function (req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization')?.split(' ')[1]
    if (!token) {
      throw new Error('Token not found')
    }

    // lấy trong payload ra
    const decoded = jwt.verify(token, environment.ACCESS_TOKEN_SECRET as string)
    log('decoded', decoded)
    req.user = decoded

    next()
  }
}
