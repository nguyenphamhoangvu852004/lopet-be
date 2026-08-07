import { PERMISSIONSCOPE } from '~/entities/permissions.entity'
import { ROLENAME } from '~/entities/roles.entity'

/**
 * Danh mục permission — nguồn sự thật duy nhất.
 *
 * Bảng `permissions` / `role_permission` trong DB được seed từ đúng file này
 * (xem authz/permission.seed.ts) để có thể truy vấn/hiển thị, nhưng bản trong
 * code mới là bản dùng để quyết định ở runtime: nó versioned theo git, test
 * được, và không cần cache invalidation.
 *
 * Quy ước mã: 'resource:action' hoặc 'resource:action:own'.
 * Hậu tố ':own' nghĩa là qua được tầng permission vẫn CHƯA đủ — còn phải qua
 * tầng ownership (requireOwnership) mới được đụng vào tài nguyên cụ thể.
 */
export interface PermissionDef {
  code: string
  resource: string
  action: string
  scope: PERMISSIONSCOPE
  description: string
}

function def(code: string, description: string): PermissionDef {
  const [resource, action, own] = code.split(':')
  return {
    code,
    resource,
    action,
    scope: own === 'own' ? PERMISSIONSCOPE.OWN : PERMISSIONSCOPE.ANY,
    description
  }
}

/**
 * Quyền của MỌI tài khoản đã đăng nhập.
 *
 * Đây là chỗ thay thế cho role 'USER' cũ: USER không phân biệt được gì cả vì
 * nó bằng đúng "đã xác thực", nên nó là baseline chứ không phải một bản ghi role.
 */
export const BASELINE_PERMISSIONS: PermissionDef[] = [
  def('post:create', 'Đăng bài'),
  def('post:update:own', 'Sửa bài của chính mình'),
  def('post:delete:own', 'Xoá bài của chính mình'),
  def('comment:create', 'Bình luận'),
  def('comment:delete:own', 'Xoá bình luận của chính mình'),
  def('group:create', 'Tạo nhóm'),
  def('group:update:own', 'Quản trị nhóm mình làm chủ'),
  def('group:delete:own', 'Xoá nhóm mình làm chủ'),
  def('report:create', 'Gửi báo cáo'),
  def('profile:update:own', 'Sửa hồ sơ của chính mình'),
  def('friendship:manage:own', 'Quản lý kết bạn của chính mình'),
  // Ba quyền ads dưới đây mới chỉ là điều kiện cần. Điều kiện đủ là tài khoản
  // phải có advertiser_profile ở trạng thái APPROVED — tầng service kiểm.
  def('advertiser:register', 'Đăng ký hồ sơ nhà quảng cáo'),
  def('ads:create', 'Tạo quảng cáo'),
  def('ads:update:own', 'Sửa quảng cáo của chính mình'),
  def('ads:delete:own', 'Xoá quảng cáo của chính mình')
]

/** Quyền vận hành, chỉ cấp cho staff */
export const STAFF_PERMISSIONS: PermissionDef[] = [
  def('account:read', 'Xem danh sách tài khoản'),
  def('account:ban', 'Khoá / mở khoá tài khoản'),
  def('account:delete', 'Xoá tài khoản'),
  def('account:setRole', 'Cấp / thu hồi role của tài khoản'),
  def('report:read', 'Xem danh sách báo cáo'),
  def('report:resolve', 'Xử lý báo cáo'),
  def('post:delete', 'Xoá bài của bất kỳ ai'),
  def('group:delete', 'Xoá nhóm của bất kỳ ai'),
  def('ads:review', 'Duyệt nội dung quảng cáo'),
  def('advertiser:read', 'Xem danh sách hồ sơ nhà quảng cáo'),
  def('advertiser:approve', 'Duyệt / đình chỉ hồ sơ nhà quảng cáo')
]

export const ALL_PERMISSIONS: PermissionDef[] = [
  ...BASELINE_PERMISSIONS,
  ...STAFF_PERMISSIONS
]

/** Ký tự đại diện: ADMIN có toàn quyền, không phải liệt kê tay */
export const WILDCARD = '*'

export const ROLE_PERMISSIONS: Record<ROLENAME, string[]> = {
  [ROLENAME.ADMIN]: [WILDCARD],
  [ROLENAME.MODERATOR]: [
    'report:read',
    'report:resolve',
    'post:delete',
    'group:delete',
    'account:ban',
    'ads:review',
    'advertiser:read'
  ],
  [ROLENAME.SUPPORT]: ['account:read', 'report:read', 'advertiser:read']
}

/** Tập quyền hiệu lực của một tài khoản = baseline + quyền của các role đang giữ */
export function resolvePermissions(roles: string[]): Set<string> {
  const granted = new Set<string>(
    BASELINE_PERMISSIONS.map((permission) => permission.code)
  )
  for (const role of roles) {
    const list = ROLE_PERMISSIONS[role as ROLENAME]
    if (!list) continue
    for (const code of list) granted.add(code)
  }
  return granted
}

/** Có `*` thì qua tất; ngoài ra chấp nhận 'resource:*' */
export function hasPermission(granted: Set<string>, required: string): boolean {
  if (granted.has(WILDCARD)) return true
  if (granted.has(required)) return true
  const resource = required.split(':')[0]
  return granted.has(`${resource}:*`)
}
