import { Brackets } from 'typeorm'
import { FRIENDSHIPSTATUS } from '~/entities/friendShips.entity'
import { GROUPTYPE } from '~/entities/groups.entity'
import { POSTSCOPE } from '~/entities/posts.entity'

/**
 * Nguồn sự thật duy nhất cho câu hỏi "người này có được xem bài viết đó không?".
 *
 * Trước đây cột posts.postScope được ghi ở mọi luồng tạo/sửa bài nhưng KHÔNG
 * một query nào đọc tới, đồng thời các route đọc bài lại không có verifyToken —
 * nghĩa là mọi bài PRIVATE và FRIEND của mọi tài khoản đều đọc được bởi khách
 * vãng lai chỉ bằng GET /v1/posts.
 *
 * Quy tắc hiển thị (khớp với ràng buộc scope mà controller đang áp lúc tạo bài:
 * bài cá nhân được PUBLIC/FRIEND/PRIVATE, bài nhóm chỉ PUBLIC/PRIVATE):
 *
 *   A. Bài cá nhân, scope PUBLIC                      -> mọi người, kể cả khách
 *   B. Bài nhóm scope PUBLIC trong nhóm PUBLIC        -> mọi người, kể cả khách
 *   C. Bài của chính mình                             -> mọi scope
 *   D. Bài cá nhân scope FRIEND của bạn bè ACCEPTED   -> chỉ bạn bè
 *   E. Bài trong nhóm mà mình là thành viên           -> mọi scope
 *
 * Cố ý dùng "bài có group_id hay không" làm cột mốc phân biệt bài nhóm / bài cá
 * nhân thay vì posts.postType: postType là `nullable: true` và chỉ được gán qua
 * Posts.setType(), nên dữ liệu cũ có thể còn NULL. Suy ra từ group_id thì không
 * bao giờ sai, vì setType() cũng chính là suy ra từ đó.
 *
 * Mặc định của mọi nhánh là ẨN: thiếu dữ liệu (group đã xoá, account null) thì
 * bài không hiện, chứ không lọt ra ngoài.
 *
 * @param viewerId id tài khoản người xem, `undefined` nghĩa là khách chưa đăng nhập
 * @param postAlias  alias của bảng posts trong query
 * @param authorAlias alias của quan hệ posts.accounts
 * @param groupAlias  alias của quan hệ posts.group
 */
export function visibleTo(
  viewerId: number | undefined,
  postAlias = 'post',
  authorAlias = 'author',
  groupAlias = 'postGroup'
): Brackets {
  return new Brackets((qb) => {
    // A. Bài cá nhân công khai
    qb.where(
      `(${groupAlias}.id IS NULL AND ${postAlias}.postScope = :scopePublic)`,
      { scopePublic: POSTSCOPE.PUBLIC }
    )

    // B. Bài công khai trong nhóm công khai.
    //    Nhóm PRIVATE thì kể cả bài scope PUBLIC cũng không lọt ra ngoài nhóm —
    //    tính riêng tư của nhóm là ràng buộc mạnh hơn scope của từng bài.
    qb.orWhere(
      `(${groupAlias}.id IS NOT NULL
        AND ${postAlias}.postScope = :scopePublic
        AND ${groupAlias}.type = :groupPublic)`,
      { scopePublic: POSTSCOPE.PUBLIC, groupPublic: GROUPTYPE.PUBLIC }
    )

    // Khách chưa đăng nhập dừng ở đây: chỉ thấy nội dung thực sự công khai.
    if (viewerId === undefined || Number.isNaN(viewerId)) {
      return
    }

    // C. Bài của chính mình — không phụ thuộc scope
    qb.orWhere(`${authorAlias}.id = :viewerId`, { viewerId })

    // D. Bài FRIEND của người đã là bạn (ACCEPTED, xét cả hai chiều gửi/nhận).
    //    Dùng EXISTS thay vì nạp trước danh sách id bạn bè rồi IN (...): danh
    //    sách bạn bè không có giới hạn trên, IN với hàng nghìn phần tử sẽ phình
    //    query và không dùng được index.
    qb.orWhere(
      `(${groupAlias}.id IS NULL
        AND ${postAlias}.postScope = :scopeFriend
        AND EXISTS (
          SELECT 1 FROM friend_ships fs
          WHERE fs.status = :friendAccepted
            AND (
              (fs.sender_id = :viewerId AND fs.receiver_id = ${authorAlias}.id)
              OR
              (fs.receiver_id = :viewerId AND fs.sender_id = ${authorAlias}.id)
            )
        ))`,
      {
        scopeFriend: POSTSCOPE.FRIEND,
        friendAccepted: FRIENDSHIPSTATUS.ACCEPTED,
        viewerId
      }
    )

    // E. Thành viên nhóm xem được mọi bài trong nhóm đó
    qb.orWhere(
      `(${groupAlias}.id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = ${groupAlias}.id AND gm.account_id = :viewerId
        ))`,
      { viewerId }
    )
  })
}
