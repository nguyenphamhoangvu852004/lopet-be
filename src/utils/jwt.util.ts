import jwt from 'jsonwebtoken'
import { environment } from '~/config/env'

export class UserPayload {
  id!: number
  email!: string
  constructor(data?: Partial<UserPayload>) {
    Object.assign(this, data)
  }
}

export function generateAccessToken(data: UserPayload): string {
  const payload = { id: data.id, email: data.email }
  const token = jwt.sign(payload as UserPayload, environment.ACCESS_TOKEN_SECRET as string, {
    expiresIn: environment.ACCESS_TOKEN_EXPIRES_IN as number
  })
  return token
}

export function generateRefreshToken(data: UserPayload): string {
  const payload = { id: data.id, email: data.email }
  const token = jwt.sign(payload as UserPayload, environment.REFRESH_TOKEN_SECRET as string, {
    expiresIn: environment.REFRESH_TOKEN_EXPIRES_IN as number
  })
  return token
}
