#!/bin/bash

echo "🚀 Bắt đầu deploy hệ thống microservices với auto scaling và load balancing..."

# Tạo namespace
echo "📦 Tạo namespace microservices..."
kubectl create namespace microservices --dry-run=client -o yaml | kubectl apply -f -

# Deploy Kafka và Zookeeper sử dụng StatefulSet
echo "📊 Deploy Kafka và Zookeeper sử dụng StatefulSet..."
kubectl apply -f kafka-statefulset.yaml

# Đợi Zookeeper khởi động
echo "⏳ Đợi Zookeeper khởi động..."
kubectl wait --for=condition=ready pod -l app=zookeeper -n microservices --timeout=300s

# Đợi Kafka khởi động
echo "⏳ Đợi Kafka khởi động..."
kubectl wait --for=condition=ready pod -l app=kafka -n microservices --timeout=300s

echo "✅ Kafka và Zookeeper đã sẵn sàng!"

# Tạo Kafka topics với nhiều partition để hỗ trợ nhiều consumer
echo "📝 Tạo Kafka topics..."
kubectl run kafka-topics-setup --image=confluentinc/cp-kafka:7.4.0 --rm -it --restart=Never -n microservices -- bash -c "
echo 'Creating Kafka topics with multiple partitions...'
kafka-topics --bootstrap-server kafka-service:9092 --create --topic order.created --partitions 3 --replication-factor 1 --if-not-exists
kafka-topics --bootstrap-server kafka-service:9092 --create --topic order.confirmed --partitions 3 --replication-factor 1 --if-not-exists
kafka-topics --bootstrap-server kafka-service:9092 --list
echo 'Kafka topics created successfully!'
"

# Build và load Docker images
echo "🐳 Build Docker images..."
cd ../order-service
docker build -t order-service:latest .
cd ../notification-service
docker build -t notification-service:latest .

# Load images vào minikube (nếu sử dụng minikube)
if command -v minikube &> /dev/null; then
    echo "📥 Load images vào minikube..."
    minikube image load order-service:latest
    minikube image load notification-service:latest
fi

# Deploy Order Service với auto scaling
echo "📋 Deploy Order Service với auto scaling..."
kubectl apply -f ../k8s/order-service-deployment.yaml

# Deploy Notification Service với auto scaling
echo "🔔 Deploy Notification Service với auto scaling..."
kubectl apply -f ../k8s/notification-service-deployment.yaml

# Deploy Pod Disruption Budget
echo "🛡️ Deploy Pod Disruption Budget..."
kubectl apply -f ../k8s/pod-disruption-budget.yaml

# Deploy Ingress với load balancing
echo "🌐 Deploy Ingress với load balancing..."
kubectl apply -f ../k8s/ingress.yaml

# Đợi các service khởi động
echo "⏳ Đợi các service khởi động..."
kubectl wait --for=condition=ready pod -l app=order-service -n microservices --timeout=300s
kubectl wait --for=condition=ready pod -l app=notification-service -n microservices --timeout=300s

echo "🎉 Deployment hoàn tất!"
echo ""
echo "📊 Trạng thái các pod:"
kubectl get pods -n microservices

echo ""
echo "🌐 Services:"
kubectl get services -n microservices

echo ""
echo "🔗 Ingress:"
kubectl get ingress -n microservices

echo ""
echo "📈 Horizontal Pod Autoscalers:"
kubectl get hpa -n microservices

echo ""
echo "🛡️ Pod Disruption Budgets:"
kubectl get pdb -n microservices

echo ""
echo "🧪 Test hệ thống với load balancing:"
echo "1. Tạo đơn hàng: curl -X POST http://localhost:3001/orders -H 'Content-Type: application/json' -d '{\"customerName\":\"Test User\",\"customerEmail\":\"test@example.com\",\"totalAmount\":100000,\"products\":[{\"name\":\"Product 1\",\"price\":100000}]}'"
echo "2. Xem danh sách đơn hàng: curl http://localhost:3001/orders"
echo "3. Xem thông báo: curl http://localhost:3002/notifications"
echo ""
echo "📊 Kiểm tra auto scaling:"
echo "kubectl get hpa -n microservices"
echo "kubectl describe hpa order-service-hpa -n microservices"
echo "kubectl describe hpa notification-service-hpa -n microservices"
echo ""
echo "🔍 Kiểm tra logs từng pod:"
echo "kubectl logs -l app=order-service -n microservices --tail=10"
echo "kubectl logs -l app=notification-service -n microservices --tail=10" 