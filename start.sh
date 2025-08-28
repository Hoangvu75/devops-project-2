#!/bin/bash

echo "🚀 Khởi động hệ thống NestJS + Kafka + NextJS với Yarn..."

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker không được cài đặt. Vui lòng cài đặt Docker trước."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose không được cài đặt. Vui lòng cài đặt Docker Compose trước."
    exit 1
fi

# Build và khởi động services
echo "📦 Building Docker images với Yarn..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

echo "⏳ Đợi các services khởi động..."
sleep 30

echo "✅ Hệ thống đã sẵn sàng!"
echo ""
echo "🌐 Giao diện Web: http://localhost:3000"
echo "📦 Order Service API: http://localhost:3001"
echo "📧 Notification Service API: http://localhost:3002"
echo ""
echo "📋 Các lệnh hữu ích:"
echo "  - Xem logs: docker-compose logs -f"
echo "  - Dừng hệ thống: docker-compose down"
echo "  - Restart: docker-compose restart"
echo ""
echo "🎉 Chúc bạn sử dụng vui vẻ!" 