# Script PowerShell mở Kubernetes Dashboard
Write-Host "🚀 Mở Kubernetes Dashboard..." -ForegroundColor Green

# Kiểm tra dashboard có đang chạy không
$dashboardRunning = kubectl get pods -n kubernetes-dashboard 2>$null | Select-String "Running"
if (-not $dashboardRunning) {
    Write-Host "❌ Kubernetes Dashboard chưa được cài đặt hoặc không chạy" -ForegroundColor Red
    Write-Host "Đang cài đặt..." -ForegroundColor Yellow
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
    Write-Host "✅ Dashboard đã được cài đặt" -ForegroundColor Green
}

# Tạo service account nếu chưa có
$serviceAccount = kubectl get serviceaccount dashboard-admin -n kubernetes-dashboard 2>$null
if (-not $serviceAccount) {
    Write-Host "🔐 Tạo service account admin..." -ForegroundColor Yellow
    kubectl create serviceaccount dashboard-admin -n kubernetes-dashboard
    kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:dashboard-admin
    Write-Host "✅ Service account đã được tạo" -ForegroundColor Green
}

# Tạo token
Write-Host "🔑 Tạo token đăng nhập..." -ForegroundColor Yellow
$TOKEN = kubectl -n kubernetes-dashboard create token dashboard-admin
Write-Host "Token: $TOKEN" -ForegroundColor Cyan
Write-Host ""

# Mở port-forward
Write-Host "🌐 Mở port-forward..." -ForegroundColor Green
Write-Host "Dashboard sẽ có sẵn tại: https://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Hướng dẫn đăng nhập:" -ForegroundColor White
Write-Host "1. Mở trình duyệt và truy cập: https://localhost:8080" -ForegroundColor White
Write-Host "2. Chọn 'Token'" -ForegroundColor White
Write-Host "3. Copy và paste token ở trên" -ForegroundColor White
Write-Host "4. Click 'Sign In'" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Lưu ý: Bỏ qua cảnh báo SSL (chọn 'Advanced' -> 'Proceed')" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 Port-forward đang chạy... (Ctrl+C để dừng)" -ForegroundColor Green

# Chạy port-forward
kubectl port-forward -n kubernetes-dashboard service/kubernetes-dashboard 8080:443 