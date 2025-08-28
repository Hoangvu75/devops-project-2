#!/bin/bash

# Script deploy Kubernetes cho microservices project
echo "🚀 Bắt đầu deploy microservices lên Kubernetes..."

# Kiểm tra kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl chưa được cài đặt. Vui lòng cài đặt kubectl trước."
    exit 1
fi

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt. Vui lòng cài đặt Docker trước."
    exit 1
fi

# Kiểm tra kết nối Kubernetes
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Không thể kết nối tới Kubernetes cluster. Vui lòng kiểm tra cấu hình kubectl."
    exit 1
fi

echo "✅ Kiểm tra môi trường thành công!"

# Build Docker images
echo "🔨 Building Docker images..."

# Build order-service
echo "Building order-service..."
cd ../order-service
docker build -t order-service:latest .
if [ $? -ne 0 ]; then
    echo "❌ Build order-service thất bại!"
    exit 1
fi

# Build notification-service
echo "Building notification-service..."
cd ../notification-service
docker build -t notification-service:latest .
if [ $? -ne 0 ]; then
    echo "❌ Build notification-service thất bại!"
    exit 1
fi

# Build frontend
echo "Building frontend..."
cd ../frontend
docker build -t frontend:latest .
if [ $? -ne 0 ]; then
    echo "❌ Build frontend thất bại!"
    exit 1
fi

cd ../k8s

echo "✅ Build images thành công!"

# Apply Kubernetes manifests
echo "📦 Deploy lên Kubernetes..."

# Tạo namespace
echo "Tạo namespace..."
kubectl apply -f namespace.yaml

# Deploy Zookeeper
echo "Deploy Zookeeper..."
kubectl apply -f zookeeper.yaml

# Chờ Zookeeper ready
echo "Chờ Zookeeper khởi động..."
kubectl wait --for=condition=available --timeout=300s deployment/zookeeper -n microservices

# Deploy Kafka
echo "Deploy Kafka..."
kubectl apply -f kafka.yaml

# Chờ Kafka ready
echo "Chờ Kafka khởi động..."
kubectl wait --for=condition=available --timeout=300s deployment/kafka -n microservices

# Deploy services
echo "Deploy Order Service..."
kubectl apply -f order-service.yaml

echo "Deploy Notification Service..."
kubectl apply -f notification-service.yaml

echo "Deploy Frontend..."
kubectl apply -f frontend.yaml

# Deploy Ingress (tùy chọn)
read -p "Bạn có muốn deploy Ingress controller không? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploy Ingress..."
    kubectl apply -f ingress.yaml
    echo "✅ Ingress deployed! Thêm 'microservices.local' vào /etc/hosts để truy cập"
fi

# Chờ tất cả services ready
echo "Chờ tất cả services khởi động..."
kubectl wait --for=condition=available --timeout=300s deployment/order-service -n microservices
kubectl wait --for=condition=available --timeout=300s deployment/notification-service -n microservices
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n microservices

echo "🎉 Deploy thành công!"

# Hiển thị thông tin services
echo ""
echo "📊 Thông tin services:"
kubectl get pods -n microservices
echo ""
kubectl get services -n microservices

# Hướng dẫn truy cập
echo ""
echo "🌐 Để truy cập ứng dụng:"
echo "1. Nếu đã deploy Ingress:"
echo "   - Thêm vào /etc/hosts: echo '127.0.0.1 microservices.local' | sudo tee -a /etc/hosts"
echo "   - Truy cập: http://microservices.local"
echo ""
echo "2. LoadBalancer (Cloud providers):"
echo "   kubectl get service frontend -n microservices"
echo ""
echo "3. Minikube:"
echo "   minikube service frontend -n microservices"
echo ""
echo "4. Port-forward (Local):"
echo "   kubectl port-forward service/frontend 3000:3000 -n microservices"
echo "   Sau đó truy cập: http://localhost:3000"

echo ""
echo "🔍 Để xem logs:"
echo "   kubectl logs -f deployment/order-service -n microservices"
echo "   kubectl logs -f deployment/notification-service -n microservices"
echo "   kubectl logs -f deployment/frontend -n microservices" 