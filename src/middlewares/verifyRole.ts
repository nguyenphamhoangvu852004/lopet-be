import { log } from 'console'
import { Request, Response, NextFunction } from 'express'
import { ROLENAME } from '~/entities/roles.entity'
interface Role {
  name: string
}

interface UserPayload {
  id: string
  email: string
  username: string
  roles: Role[]
}

export function verifyRole(requiedRoles: ROLENAME[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      const userRoles = (req.user as UserPayload).roles.map((role) => role.name)

      const hasPermission = requiedRoles.some((role) => userRoles.includes(role))
      log('hasPermission', hasPermission)
      log('userRoles', userRoles)
      if (!hasPermission) {
        res.status(403).json({ status: 403, message: 'Forbidden: No permission' })
        return
      }

      next()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      res.status(401).json({ status: 401, message })
      return
    }
  }
}
