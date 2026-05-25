
## API Reference

#### Get all items

```http
  GET /api/items
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get item

```http
  GET /api/items/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |

#### add(num1, num2)

Takes two numbers and returns the sum.

# SEAL - Hackathon Hub Platform 🚀

**SEAL - Hackathon Hub** là một nền tảng hiện đại và toàn diện được thiết kế để quản lý và tổ chức các sự kiện Hackathon. Dự án được phát triển với cấu trúc tối ưu, giao diện hiện đại mang tính thẩm mỹ cao cùng kiến trúc Backend sạch (**Clean Architecture**) giúp dễ dàng mở rộng và bảo trì.

---

## 🏗️ Kiến trúc & Công nghệ Sử dụng

Dự án được phân chia thành hai phần độc lập là **Frontend** và **Backend**, được kết nối thông qua các chuẩn Restful API.

### 1. Frontend (Giao diện người dùng)
* **Core**: React 18, TypeScript, Vite.
* **Styling**: Tailwind CSS (giao diện responsive, mượt mà và tối giản).
* **Icons & UI**: Lucide React.
* **Quản lý trạng thái & API**: Fetch API kết hợp cùng cơ chế lưu trữ bảo mật Token qua `localStorage`.

### 2. Backend (Hệ thống xử lý & Cơ sở dữ liệu)
* **Core**: PHP (đảm bảo hiệu năng tốt và gọn nhẹ).
* **Kiến trúc**: **Clean Architecture** chia làm 4 tầng độc lập:
  * **Domain Layer** (Thực thể và Nghiệp vụ lõi - *Entities, Repositories Interfaces*).
  * **Services Layer** (Kịch bản xử lý nghiệp vụ - *Use Cases*).
  * **Infrastructure Layer** (Cấu trúc dữ liệu Database, ánh xạ thực thể - *Doctrine ORM, Mappers, Repositories*).
  * **Presentation Layer** (Các endpoint nhận yêu cầu từ client - *Controllers*).
* **ORM**: Doctrine ORM (Quản lý Database dạng hướng đối tượng).
* **Database**: MySQL 8.0.
* **Môi trường ảo hóa**: Docker & Docker Compose.

---

## 📁 Cấu trúc Thư mục Chính

```text
SEAL/
├── backend/               # Mã nguồn Backend (PHP)
│   ├── src/               # Tầng xử lý chính (Domain, Services, Infrastructure, Presentation, DTO)
│   ├── public/            # Điểm đón đầu yêu cầu chính (index.php, router)
│   ├── config/            # Cấu hình Doctrine & Cơ sở dữ liệu
│   ├── cli-config.php     # Cấu hình CLI cho Doctrine
│   └── Dockerfile         # Dockerize cho PHP + Apache
├── Frontend/              # Mã nguồn Frontend (React + Vite)
│   ├── src/
│   │   ├── app/           # Hệ thống Page & Components chính (Login, Register, Dashboard,...)
│   │   └── main.tsx       # File khởi tạo React
│   └── package.json       # Dependencies và các Script chạy Frontend
├── docker-compose.yml     # Quản lý Docker Container (Backend & Database)
└── README.md              # File mô tả dự án (File này)
```

---

## ⚡ Hướng dẫn Khởi chạy Dự án

Để chạy được dự án này trên máy tính của bạn, yêu cầu máy đã cài sẵn **Docker**, **Node.js** (v18 trở lên).

### Bước 1: Khởi động Backend & Cơ sở dữ liệu (Docker)
1. Mở Terminal tại thư mục gốc của dự án (`SEAL/`).
2. Chạy lệnh dựng và khởi động các container:
   ```bash
   docker compose up -d --build
   ```
3. Sau khi khởi động xong:
   * **Backend API** sẽ chạy tại địa chỉ: `http://localhost:8000`
   * **Cơ sở dữ liệu MySQL** sẽ chạy tại cổng: `3307`

### Bước 2: Cập nhật Cấu trúc Bảng Database (Doctrine)
Để tự động tạo và cập nhật các bảng cơ sở dữ liệu dựa trên cấu trúc Thực thể (Entities) của Backend, hãy chạy lệnh sau:
```bash
docker exec php_clean_backend vendor/bin/doctrine orm:schema-tool:update --force
```

### Bước 3: Khởi chạy Giao diện Frontend (React)
1. Mở một Terminal mới và di chuyển vào thư mục Frontend:
   ```bash
   cd Frontend
   ```
2. Cài đặt các gói phụ thuộc (Dependencies):
   ```bash
   npm install
   ```
3. Khởi chạy máy chủ phát triển (Development Server):
   ```bash
   npm run dev
   ```
4. Truy cập giao diện Web trên trình duyệt theo địa chỉ mặc định của Vite: `http://localhost:5173/`

---

## 🔑 Thông tin kết nối Cơ sở dữ liệu (Dành cho DBeaver / Database Client)

Nếu bạn muốn kết nối trực tiếp từ các phần mềm quản lý Database bên ngoài (như DBeaver, TablePlus, VS Code Database Client):

* **Host**: `127.0.0.1` (hoặc `localhost`)
* **Port**: `3307`
* **Database Name**: `CleanDb`
* **Username**: `clean_user` *(hoặc `root`)*
* **Password**: `user_secret_password` *(hoặc `root_secret_password` của root)*
* **Tham số bổ sung (Extra Params - Bắt buộc cho MySQL 8.0)**:
  ```text
  allowPublicKeyRetrieval=true&useSSL=false
  ```

---

## 🛡️ Tài khoản Admin Mặc định để Thử nghiệm

Hệ thống đã được thiết lập sẵn tài khoản quản trị cấp cao (**ADMIN**) để bạn đăng nhập thử nghiệm:

* **Email**: `admin1@gmail.com`
* **Mật khẩu**: `hack123`
* **Quyền hạn**: `ADMIN`
