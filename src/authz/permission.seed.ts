import { mySqlDataSource } from '~/config/appDataSource'
import { logger } from '~/config/logger'
import { Permissions } from '~/entities/permissions.entity'
import { ROLENAME, Roles } from '~/entities/roles.entity'
import {
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  WILDCARD
} from '~/authz/permission.catalog'

/**
 * Đồng bộ bảng permissions / roles / role_permission theo đúng danh mục trong
 * permission.catalog.ts. Chạy idempotent nên gọi mỗi lần khởi động đều được.
 */
export async function seedAuthorization(): Promise<void> {
  const permissionRepo = mySqlDataSource.getRepository(Permissions)
  const roleRepo = mySqlDataSource.getRepository(Roles)

  // 1. permissions
  for (const item of ALL_PERMISSIONS) {
    const existed = await permissionRepo.findOneBy({ code: item.code })
    if (existed) {
      existed.resource = item.resource
      existed.action = item.action
      existed.scope = item.scope
      existed.description = item.description
      await permissionRepo.save(existed)
    } else {
      await permissionRepo.save(new Permissions({ ...item }))
    }
  }

  // 2. roles (chỉ platform role — USER là baseline, ADS đã thành capability)
  for (const name of Object.values(ROLENAME)) {
    const existed = await roleRepo.findOneBy({ name })
    if (!existed) {
      await roleRepo.save(new Roles({ name, createdAt: new Date() }))
    }
  }

  // 3. role_permission
  const allPermissions = await permissionRepo.find()
  for (const name of Object.values(ROLENAME)) {
    const role = await roleRepo.findOne({
      where: { name },
      relations: { permissions: true }
    })
    if (!role) continue

    const codes = ROLE_PERMISSIONS[name] ?? []
    role.permissions = codes.includes(WILDCARD)
      ? allPermissions
      : allPermissions.filter((permission) => codes.includes(permission.code))

    await roleRepo.save(role)
  }

  logger.info(
    `Seed authorization xong: ${ALL_PERMISSIONS.length} permissions, ${Object.values(ROLENAME).length} roles`
  )
}
