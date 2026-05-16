<img width="901" height="738" alt="image" src="https://github.com/user-attachments/assets/75f3189a-ca58-4312-97d0-f5c0a0eb5547" /># Lopet Social Media Backend (lopet-be)
**Tài liệu được viết bởi AI**
## 📌 Giới thiệu dự án
**Lopet Social Media** là hệ thống Backend cho một nền tảng mạng xã hội hiện đại, được xây dựng với mục tiêu cung cấp hiệu năng cao, khả năng mở rộng tốt và tính bảo mật chặt chẽ. Hệ thống hỗ trợ đầy đủ các tính năng của một mạng xã hội như quản lý tài khoản, tương tác bài viết, kết bạn, nhắn tin thời gian thực và quản trị nội dung.

---

## 🛠 Công nghệ sử dụng

Hệ thống được phát triển dựa trên các công nghệ mạnh mẽ và phổ biến:

- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) (Đảm bảo type safety và code sạch).
- **Framework:** [Express.js](https://expressjs.com/) (Nhanh, nhẹ và linh hoạt).
- **ORM:** [TypeORM](https://typeorm.io/) (Quản lý database theo mô hình OOP).
- **Database:** [MySQL](https://www.mysql.com/) (Lưu trữ dữ liệu quan hệ).
- **Caching:** [Redis](https://redis.io/) (Tăng tốc độ truy xuất dữ liệu và quản lý session).
- **Authentication:** [JWT](https://jwt.io/) & [Bcryptjs](https://www.npmjs.com/package/bcryptjs) (Bảo mật tài khoản).
- **File Storage:** [Cloudinary](https://cloudinary.com/) (Lưu trữ hình ảnh và media).
- **Email:** [Nodemailer](https://nodemailer.com/) (Gửi mã xác thực và thông báo qua Gmail).
- **Real-time:** [Socket.io](https://socket.io/) (Nhắn tin và thông báo tức thời).
- **Validation:** [Joi](https://joi.dev/) (Kiểm tra dữ liệu đầu vào).
- **Logging:** [Winston](https://github.com/winstonjs/winston) (Ghi log hệ thống).
- **Testing:** [Jest](https://jestjs.io/) (Unit & Integration testing).

---
## Database Relationships
<img width="922" height="742" alt="image" src="https://github.com/user-attachments/assets/16f4da67-e482-4e31-8197-e661e99a3dc9" />

## 📂 Cấu trúc dự án

Dự án được tổ chức theo kiến trúc modular, giúp dễ dàng bảo trì và phát triển thêm tính năng:

```text
src/
├── config/             # Cấu hình Database, Redis, Mail, Cloudinary...
├── entities/           # Các Model/Entity của TypeORM
├── modules/            # Logic nghiệp vụ chính (Controllers, Services)
│   ├── account/        # Quản lý tài khoản người dùng
│   ├── auth/           # Đăng ký, đăng nhập, bảo mật
│   ├── post/           # Bài viết và tương tác bài viết
│   ├── friendShip/     # Tính năng kết bạn
│   ├── message/        # Nhắn tin (Real-time)
│   ├── notification/   # Thông báo hệ thống
│   ├── group/          # Nhóm và cộng đồng
│   └── ...             # Các module khác (Ads, Admin, Report, v.v.)
├── routes/             # Định nghĩa các API endpoints
├── middlewares/        # Các bộ lọc (Auth, Error handling, Logging)
├── validation/         # Định nghĩa schema kiểm tra dữ liệu
├── utils/              # Các hàm tiện ích dùng chung
├── server.ts           # Khởi tạo server và các plugin
└── index.ts            # Entry point của ứng dụng
```

---

## 🚀 Hướng dẫn chạy dự án

### 1. Yêu cầu hệ thống
- **Node.js** (Phiên bản 18 trở lên)
- **MySQL Server**
- **Redis Server**

### 2. Cài đặt dependencies
Mở terminal tại thư mục gốc và chạy:
```bash
npm install
```

### 3. Cấu hình môi trường
- Sao chép file `example.env` thành `.env`:
  ```bash
  cp example.env .env
  ```
- Cập nhật các thông số trong file `.env` phù hợp với máy cá nhân (Database info, Redis info, Cloudinary key, v.v.).

### 4. Chạy dự án

**Chế độ phát triển (Development):**
```bash
npm run dev:start
```
Hệ thống sẽ chạy với `nodemon` và tự động restart khi có thay đổi code.

**Build dự án (Production):**
```bash
npm run build
npm start
```

### 5. Kiểm tra code & Định dạng
```bash
npm run lint         # Kiểm tra lỗi coding style
npm run prettier:fix  # Tự động định dạng code
```

---

## 📋 Các tính năng chính
- **Auth:** Đăng ký, Đăng nhập, Quên mật khẩu, Xác thực OTP qua Email.
- **Social:** Đăng bài (ảnh/video), Like, Comment, Chia sẻ bài viết.
- **Networking:** Gửi lời mời kết bạn, Chấp nhận/Từ chối, Chặn người dùng.
- **Messaging:** Chat cá nhân/nhóm thời gian thực với Socket.io.
- **Discovery:** Tìm kiếm người dùng, nhóm và bài viết.
- **Admin:** Quản lý người dùng, bài viết vi phạm, báo cáo người dùng.

---

## 📝 Giấy phép
Dự án được phát triển cho mục đích học tập và xây dựng nền tảng mạng xã hội cá nhân.
