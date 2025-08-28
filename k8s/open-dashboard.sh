#!/bin/bash

# Script mở Kubernetes Dashboard
echo "🚀 Mở Kubernetes Dashboard..."

# Kiểm tra dashboard có đang chạy không
if ! kubectl get pods -n kubernetes-dashboard | grep -q "Running"; then
    echo "❌ Kubernetes Dashboard chưa được cài đặt hoặc không chạy"
    echo "Đang cài đặt..."
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
    echo "✅ Dashboard đã được cài đặt"
fi

# Tạo service account nếu chưa có
if ! kubectl get serviceaccount dashboard-admin -n kubernetes-dashboard &> /dev/null; then
    echo "🔐 Tạo service account admin..."
    kubectl create serviceaccount dashboard-admin -n kubernetes-dashboard
    kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:dashboard-admin
    echo "✅ Service account đã được tạo"
fi

# Tạo token
echo "🔑 Tạo token đăng nhập..."
TOKEN=$(kubectl -n kubernetes-dashboard create token dashboard-admin)
echo "Token: $TOKEN"
echo ""

# Mở port-forward
echo "🌐 Mở port-forward..."
echo "Dashboard sẽ có sẵn tại: https://localhost:8080"
echo ""
echo "📋 Hướng dẫn đăng nhập:"
echo "1. Mở trình duyệt và truy cập: https://localhost:8080"
echo "2. Chọn 'Token'"
echo "3. Copy và paste token ở trên"
echo "4. Click 'Sign In'"
echo ""
echo "⚠️  Lưu ý: Bỏ qua cảnh báo SSL (chọn 'Advanced' -> 'Proceed')"
echo ""
echo "🔄 Port-forward đang chạy... (Ctrl+C để dừng)"

# Chạy port-forward
kubectl port-forward -n kubernetes-dashboard service/kubernetes-dashboard 8080:443 