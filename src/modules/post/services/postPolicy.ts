import { Groups, GROUPTYPE } from '~/entities/groups.entity'
import { POSTSCOPE } from '~/entities/posts.entity'
import { BadRequest, Forbidden, NotFound } from '~/error/error.custom'
import IGroupRepo from '~/modules/group/repositories/IGroupRepo'

/**
 * Nguồn sự thật cho phía GHI, đối xứng với postVisibility.ts của phía ĐỌC.
 *
 * postVisibility.ts trả lời "ai được xem bài nào" bằng một mệnh đề SQL; file này
 * trả lời "ai được tạo/sửa bài ở đâu, với scope nào". Tách riêng vì hai câu hỏi
 * chạy ở hai tầng khác nhau (query vs service) nhưng phải nhất quán với nhau —
 * để rải rác trong controller thì mỗi endpoint mới lại quên một nhánh.
 */

/**
 * Xác định group cho một bài viết sắp được tạo, đồng thời kiểm tra người tạo có
 * quyền đăng vào đó không.
 *
 * Trước đây PostServiceImpl.create() chỉ nạp group rồi gắn vào bài mà KHÔNG hỏi
 * người đăng có phải thành viên hay không, nên bất kỳ tài khoản nào đã đăng nhập
 * cũng đăng được bài vào một group PRIVATE mà mình không thuộc về — bài đó sau
 * đó hiện ra với toàn bộ thành viên thật của nhóm (nhánh E của visibleTo).
 *
 * Quy tắc:
 *   - Group PUBLIC  -> mọi tài khoản đã đăng nhập đều đăng được
 *   - Group PRIVATE -> phải có bản ghi trong group_members
 *
 * group_members không có cột trạng thái (PENDING/BANNED/LEFT): mô hình hiện tại
 * xoá hẳn bản ghi khi rời nhóm, nên "tồn tại bản ghi" đã đúng nghĩa là thành
 * viên đang hoạt động. Nếu sau này thêm trạng thái thì chỉ phải sửa ở đây.
 *
 * Group không tồn tại -> NotFound thay vì âm thầm gán group = null. Hành vi cũ
 * biến một bài đáng lẽ thuộc nhóm thành bài cá nhân với scope PUBLIC, tức là
 * đẩy nội dung người dùng tưởng đang đăng trong nhóm ra ngoài công khai.
 *
 * Người ngoài đăng vào group PRIVATE -> Forbidden chứ không phải NotFound: sự
 * tồn tại của group vốn đã công khai qua GET /v1/groups/:id (route không có xác
 * thực), nên che giấu ở đây không giấu được gì mà chỉ làm client khó hiểu lỗi.
 * Khác với bài viết — ở đó NotFound là bắt buộc vì id bài là thứ duy nhất cần
 * đoán để dò nội dung riêng tư.
 */
export async function resolveGroupForPost(
  groupRepo: IGroupRepo,
  groupId: number,
  accountId: number
): Promise<Groups> {
  const group = await groupRepo.findById(groupId)
  if (!group) throw new NotFound('Không tìm thấy nhóm')

  if (group.type === GROUPTYPE.PRIVATE) {
    const membership = await groupRepo.findMember(group.id, accountId)
    if (!membership) {
      throw new Forbidden('Bạn không phải thành viên của nhóm này')
    }
  }

  return group
}

/**
 * Chuẩn hoá scope do client gửi lên và chặn các tổ hợp vô nghĩa.
 *
 * Bài cá nhân: PUBLIC | FRIEND | PRIVATE.
 * Bài nhóm:    PUBLIC | PRIVATE. FRIEND bị loại vì "bạn bè của tác giả" không
 * phải một tập con của nhóm — cho phép nó sẽ tạo ra một chiều hiển thị thứ ba
 * không nhánh nào trong visibleTo() diễn tả được, và bài sẽ lặng lẽ biến mất
 * khỏi mọi feed.
 *
 * `isGroupPost` PHẢI được suy ra từ group thật của bài (đã nạp từ DB), không
 * bao giờ từ groupId trong body. Bug cũ ở PostController.update(): danh sách
 * scope hợp lệ được chọn theo `data.groupId` của request, nên chỉ cần bỏ trống
 * groupId là đặt được scope FRIEND cho một bài đang nằm trong nhóm.
 *
 * Lưu ý về "trần" hiển thị: scope của bài chỉ THU HẸP chứ không nới rộng được
 * phạm vi của nhóm. Một bài scope PUBLIC trong nhóm PRIVATE vẫn không lọt ra
 * ngoài, vì nhánh B của visibleTo() đòi thêm điều kiện group.type = PUBLIC.
 * Ràng buộc đó nằm ở tầng query nên không endpoint nào đi vòng qua được.
 */
export function parseScope(rawScope: unknown, isGroupPost: boolean): POSTSCOPE {
  const allowed: POSTSCOPE[] = isGroupPost
    ? [POSTSCOPE.PUBLIC, POSTSCOPE.PRIVATE]
    : [POSTSCOPE.PUBLIC, POSTSCOPE.FRIEND, POSTSCOPE.PRIVATE]

  const scope = allowed.find((item) => item === rawScope)
  if (!scope) {
    throw new BadRequest(
      `Scope không hợp lệ cho ${isGroupPost ? 'bài nhóm' : 'bài cá nhân'}: ` +
        `chỉ nhận ${allowed.join(' | ')}`
    )
  }
  return scope
}
