#!/bin/bash

echo "🧹 Bắt đầu cleanup hệ thống với auto scaling..."

# Xóa Ingress
echo "🗑️ Xóa Ingress..."
kubectl delete -f ingress.yaml --ignore-not-found=true

# Xóa Pod Disruption Budgets
echo "🗑️ Xóa Pod Disruption Budgets..."
kubectl delete -f pod-disruption-budget.yaml --ignore-not-found=true

# Xóa Order Service
echo "🗑️ Xóa Order Service..."
kubectl delete -f order-service-deployment.yaml --ignore-not-found=true

# Xóa Notification Service
echo "🗑️ Xóa Notification Service..."
kubectl delete -f notification-service-deployment.yaml --ignore-not-found=true

# Xóa Kafka và Zookeeper StatefulSet
echo "🗑️ Xóa Kafka và Zookeeper StatefulSet..."
kubectl delete -f kafka-statefulset.yaml --ignore-not-found=true

# Xóa Persistent Volumes (nếu có)
echo "🗑️ Xóa Persistent Volumes..."
kubectl delete -f persistent-volumes.yaml --ignore-not-found=true

# Xóa namespace
echo "🗑️ Xóa namespace microservices..."
kubectl delete namespace microservices --ignore-not-found=true

echo "✅ Cleanup hoàn tất!"
echo "💡 Để xóa hoàn toàn, bạn có thể chạy:"
echo "   kubectl delete all --all --all-namespaces"
echo "   kubectl delete hpa --all --all-namespaces"
echo "   kubectl delete pdb --all --all-namespaces" 