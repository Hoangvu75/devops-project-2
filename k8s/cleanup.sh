#!/bin/bash

# Script cleanup Kubernetes deployment
echo "🧹 Dọn dẹp Kubernetes deployment..."

# Xóa tất cả resources trong namespace
echo "Xóa tất cả resources..."
kubectl delete -f frontend.yaml
kubectl delete -f notification-service.yaml
kubectl delete -f order-service.yaml
kubectl delete -f kafka.yaml
kubectl delete -f zookeeper.yaml

# Xóa namespace (sẽ xóa tất cả resources còn lại)
echo "Xóa namespace..."
kubectl delete -f namespace.yaml

echo "✅ Dọn dẹp hoàn tất!"

# Xóa Docker images (tùy chọn)
read -p "Bạn có muốn xóa Docker images không? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Xóa Docker images..."
    docker rmi order-service:latest notification-service:latest frontend:latest
    echo "✅ Xóa images hoàn tất!"
fi 