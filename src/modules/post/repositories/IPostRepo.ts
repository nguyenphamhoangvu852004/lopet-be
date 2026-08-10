import { Posts } from '~/entities/posts.entity'
import { GetPostListInputDTO } from '~/modules/post/dto/Get'

/**
 * `viewerId` là id tài khoản người đang xem, `undefined` nghĩa là khách chưa
 * đăng nhập. Mọi hàm đọc danh sách đều nhận tham số này và lọc theo quy tắc ở
 * postVisibility.ts — không có đường nào trả về bài viết mà bỏ qua bước lọc.
 */
export default interface IPostRepo {
  getSuggestList(viewerId?: number): Promise<Posts[]>
  getAll(data: GetPostListInputDTO): Promise<Posts[]>

  /** Nạp nội bộ, KHÔNG lọc quyền riêng tư — xem ghi chú ở PostRepoImpl.getOne */
  getOne(id): Promise<Posts | null>

  /** Bản có lọc quyền riêng tư, dùng cho route đọc công khai */
  getOneVisibleTo(id: number, viewerId?: number): Promise<Posts | null>

  update(data: Posts): Promise<Posts | null>
  getByAccountId(id: number, viewerId?: number): Promise<Posts[]>
  create(data: Posts): Promise<Posts | null>
  delete(id: number): Promise<Posts | null>
}
