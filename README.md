# NestJS Kafka Microservices

Một hệ thống microservices được xây dựng với NestJS, Apache Kafka và NextJS, bao gồm:
- **Order Service**: Quản lý đơn hàng (NestJS)
- **Notification Service**: Gửi thông báo qua email (NestJS)
- **Frontend**: Giao diện web quản lý (NextJS)

## Kiến trúc hệ thống

```
┌─────────────────┐                    ┌─────────────────────┐
│    Frontend     │ ◄─── HTTP API ───► │   Order Service     │
│   (Port 3000)   │                    │   (Port 3001)       │
└─────────────────┘                    └─────────────────────┘
        │                                          │
        │                                          │ Kafka Events
        │ HTTP API                                 ▼
        │                              ┌─────────────────────┐
        └─────────────────────────────►│ Notification Service │
                                       │    (Port 3002)      │
                                       └─────────────────────┘
                                                  │
                                                  │
                                                  ▼
                               ┌─────────────────────────────────────┐
                               │           Apache Kafka              │
                               │         (Port 9092)                 │
                               └─────────────────────────────────────┘
```

## Cài đặt và chạy

### Yêu cầu hệ thống
- Docker và Docker Compose
- Node.js 18+ (nếu chạy local)

### Chạy với Docker (Khuyến nghị)

1. Clone repository và di chuyển vào thư mục:
```bash
cd devops-project-2
```

2. Build và khởi động tất cả services:
```bash
npm run docker:build
npm run docker:up
```

3. Kiểm tra logs:
```bash
npm run docker:logs
```

4. Dừng services:
```bash
npm run docker:down
```

### Các services sẽ chạy trên:
- **Frontend**: Port 3000 (NextJS Web App)
- **Order Service**: Port 3001 (NestJS API)
- **Notification Service**: Port 3002 (NestJS API)
- **Kafka**: Port 9092
- **Zookeeper**: Port 2181

## API Endpoints

### Order Service (http://localhost:3001)

#### Tạo đơn hàng mới
```bash
POST /orders
Content-Type: application/json

{
  "customerName": "Nguyễn Văn A",
  "customerEmail": "nguyenvana@example.com",
  "products": [
    {
      "productId": "prod-001",
      "productName": "Laptop Dell",
      "quantity": 1,
      "price": 15000000
    }
  ],
  "totalAmount": 15000000
}
```

#### Lấy danh sách đơn hàng
```bash
GET /orders
```

#### Lấy thông tin đơn hàng theo ID
```bash
GET /orders/{orderId}
```

#### Xác nhận đơn hàng
```bash
PUT /orders/{orderId}/confirm
```

### Notification Service (http://localhost:3002)

#### Lấy danh sách thông báo
```bash
GET /notifications
```

#### Lấy thông báo theo đơn hàng
```bash
GET /notifications/order/{orderId}
```

## Luồng hoạt động

### Giao diện Web (Khuyến nghị):
1. **Truy cập Web**: Mở http://localhost:3000 trên trình duyệt
2. **Tạo đơn hàng**: Điền form và submit trên giao diện web
3. **Kafka Event**: Order Service gửi event `order.created` qua Kafka
4. **Xử lý thông báo**: Notification Service nhận event và gửi email thông báo
5. **Xác nhận đơn hàng**: Click nút "Xác nhận" trên giao diện web
6. **Kafka Event**: Order Service gửi event `order.confirmed` qua Kafka
7. **Thông báo xác nhận**: Notification Service gửi email xác nhận
8. **Theo dõi**: Xem danh sách đơn hàng và thông báo realtime

### API trực tiếp:
1. **Tạo đơn hàng**: Client gửi POST request đến Order Service
2. **Kafka Event**: Order Service gửi event `order.created` qua Kafka
3. **Xử lý thông báo**: Notification Service nhận event và gửi email thông báo
4. **Xác nhận đơn hàng**: Client gửi PUT request để xác nhận đơn hàng
5. **Kafka Event**: Order Service gửi event `order.confirmed` qua Kafka
6. **Thông báo xác nhận**: Notification Service gửi email xác nhận

## Ví dụ sử dụng

### Sử dụng giao diện Web (Dễ nhất):
1. Mở trình duyệt và truy cập: http://localhost:3000
2. Điền thông tin khách hàng và sản phẩm vào form
3. Click "Tạo đơn hàng" 
4. Xem đơn hàng được tạo trong danh sách
5. Click "Xác nhận đơn hàng" nếu muốn
6. Xem thông báo email đã được gửi

### Sử dụng API trực tiếp:

#### 1. Tạo đơn hàng mới
```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Trần Thị B",
    "customerEmail": "tranthib@example.com",
    "products": [
      {
        "productId": "prod-002",
        "productName": "iPhone 15",
        "quantity": 2,
        "price": 25000000
      }
    ],
    "totalAmount": 50000000
  }'
```

#### 2. Xem thông báo đã được gửi
```bash
curl http://localhost:3002/notifications
```

#### 3. Xác nhận đơn hàng
```bash
curl -X PUT http://localhost:3001/orders/{orderId}/confirm
```

## Kafka Topics

- `order.created`: Được gửi khi tạo đơn hàng mới
- `order.confirmed`: Được gửi khi xác nhận đơn hàng

## Monitoring

### Xem logs của từng service:
```bash
docker-compose logs -f order-service
docker-compose logs -f notification-service
docker-compose logs -f kafka
```

### Kiểm tra Kafka topics:
```bash
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list
```

## Troubleshooting

### Lỗi kết nối Kafka
- Đảm bảo Kafka container đã khởi động hoàn toàn trước khi start các service khác
- Kiểm tra network connectivity giữa các containers

### Services không khởi động
- Kiểm tra logs: `docker-compose logs [service-name]`
- Đảm bảo ports không bị conflicts
- Restart services: `docker-compose restart [service-name]`

## Phát triển thêm

### Thêm tính năng mới:
1. Thêm services mới vào `docker-compose.yml`
2. Tạo Kafka topics mới cho communication
3. Implement message patterns trong controllers

### Database Integration:
- Thêm PostgreSQL/MongoDB containers
- Cấu hình TypeORM/Mongoose
- Migrate data từ in-memory storage

### Authentication:
- Implement JWT authentication
- Thêm API Gateway
 