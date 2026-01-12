# Vibe Sport - Sport Field Booking System

Hệ thống đặt sân thể thao được xây dựng bằng NestJS, Prisma, PostgreSQL và Redis.

## Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn
- PostgreSQL database
- Redis server

## Cài đặt

1. **Clone repository và cài đặt dependencies:**
```bash
cd vibe-sport
npm install
```

2. **Cấu hình môi trường:**
   
   Tạo file `.env` trong thư mục `vibe-sport/` với nội dung:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Application
PORT=3000
NODE_ENV=development
```

3. **Chạy Prisma migrations:**
```bash
npx prisma migrate dev
```

4. **Seed database (nếu có):**
```bash
npx prisma db seed
```

## Chạy dự án

### Development mode
```bash
npm run start:dev
```

### Production mode
```bash
# Build
npm run build

# Start
npm run start:prod
```

### Debug mode
```bash
npm run start:debug
```

## Prisma Commands

### Tạo migration mới
```bash
npx prisma migrate dev --name migration-name
```

### Áp dụng migrations
```bash
npx prisma migrate deploy
```

### Reset database
```bash
npx prisma migrate reset
```

### Mở Prisma Studio (GUI)
```bash
npx prisma studio
```

### Generate Prisma Client
```bash
npx prisma generate
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
vibe-sport/
├── prisma/              # Prisma schema và migrations
├── src/
│   ├── application/     # Use cases và ports
│   ├── domain/          # Entities và business logic
│   ├── infrastructure/  # Database, Redis, Repositories
│   ├── interfaces/      # HTTP controllers, guards, decorators
│   └── modules/         # Feature modules
└── test/                # E2E tests
```

## API Documentation

Sau khi chạy server, truy cập:
- Swagger UI: `http://localhost:8080/api`
- Health check: `http://localhost:8080/health`

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra `DATABASE_URL` trong file `.env`
- Đảm bảo PostgreSQL đang chạy
- Kiểm tra quyền truy cập database

### Lỗi Redis connection
- Kiểm tra Redis server đang chạy
- Xác nhận cấu hình `REDIS_HOST` và `REDIS_PORT`

### Lỗi Prisma Client
```bash
npx prisma generate
```

## License

[MIT](LICENSE)
