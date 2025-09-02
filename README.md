# DevOps Project 2 — Hướng dẫn vận hành

## 1) Tổng quan
Dự án gồm 3 thành phần chính chạy trên Kubernetes:
- Order Service (NestJS)
- Notification Service (NestJS)
- Kafka + Zookeeper (StatefulSet)

## 2) Kiến trúc và cổng
- Order Service: port nội bộ 3000, Service expose port 3001
- Notification Service: port nội bộ 3000, Service expose port 3002
- Kafka/Zookeeper: chạy dạng StatefulSet với PVC động (StorageClass mặc định)
- Ingress (tùy chọn): định tuyến `order-service.local` → `order-service:3001`, `notification-service.local` → `notification-service:3002`

Lưu ý: Trong môi trường local (Docker Desktop Windows), Ingress có thể không lắng nghe trực tiếp port 80/443. Khi đó, dùng `kubectl port-forward` để truy cập nhanh.

## 3) Yêu cầu môi trường
- Docker Desktop có bật Kubernetes
- kubectl (đi kèm Docker Desktop)
- Node.js 18+ và Yarn (nếu muốn chạy/build thủ công)
- Powershell (Windows) hoặc bash (WSL/Linux/macOS)

## 4) Thiết lập ban đầu
- Mở Docker Desktop và bật Kubernetes
- Đảm bảo context kubectl trỏ về Docker Desktop: `kubectl config current-context`
- Clone dự án về máy và mở terminal tại thư mục gốc

## 5) Build image backend (local)
Dự án đã có Dockerfile cho 2 service. Khi triển khai qua script, image sẽ được build và nạp vào Docker Desktop tự động. Nếu muốn build thủ công:

Bash (WSL/macOS/Linux):
```bash
# Tại thư mục gốc
# Build order-service
docker build -t order-service:latest ./backend/order-service
# Build notification-service
docker build -t notification-service:latest ./backend/notification-service
```

PowerShell (Windows):
```powershell
# Tại thư mục gốc
# Build order-service
docker build -t order-service:latest .\backend\order-service
# Build notification-service
docker build -t notification-service:latest .\backend\notification-service
```

## 6) Triển khai Kubernetes
Các manifest và script nằm trong `backend/k8s`.

- Triển khai đầy đủ (Kafka/ZK StatefulSet, Services, HPA, PDB, Ingress):
```bash
# Bash (WSL/macOS/Linux)
cd backend/k8s
./deploy-with-autoscaling.sh
```

Nếu đang ở Windows PowerShell và không có bash, bạn có thể mở WSL hoặc chuyển đổi các lệnh tương đương. Script bash bao gồm các bước:
- Tạo namespace (nếu có)
- Triển khai Zookeeper & Kafka (StatefulSet + PVC động)
- Build & load image local cho order/notification (imagePullPolicy: Never)
- Áp dụng Deployment/Service/HPA/PDB/Ingress
- Tạo topic Kafka (nếu cần)

- Dọn dẹp toàn bộ tài nguyên:
```bash
# Bash (WSL/macOS/Linux)
cd backend/k8s
./cleanup-with-autoscaling.sh
```

## 7) Cài Ingress Controller (tùy chọn)
Trong môi trường production/Cloud, Ingress dùng LoadBalancer. Ở local, bạn có thể cài NGINX Ingress Controller:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
kubectl -n ingress-nginx get pods
```
Thêm bản ghi hosts (Windows):
```
C:\Windows\System32\drivers\etc\hosts
127.0.0.1 order-service.local
127.0.0.1 notification-service.local
```
Nếu không truy cập được qua port 80/443 local, dùng mục “Truy cập dịch vụ” bên dưới (port-forward).

## 8) Truy cập dịch vụ
- Cách 1: Port-forward (đề xuất cho local khi Ingress chưa sẵn sàng)
```powershell
# PowerShell — mở 2 cửa sổ nếu muốn forward cả hai service
kubectl port-forward svc/order-service 3001:3001
kubectl port-forward svc/notification-service 3002:3002
```
Sau đó truy cập:
- http://localhost:3001/orders
- http://localhost:3002/notifications

- Cách 2: Ingress (nếu controller hoạt động và hosts đã cấu hình)
```powershell
# Ví dụ test bằng Host header
Invoke-WebRequest -Uri "http://localhost/orders" -Headers @{"Host"="order-service.local"}
Invoke-WebRequest -Uri "http://localhost/notifications" -Headers @{"Host"="notification-service.local"}
```
Hoặc truy cập trình duyệt: `http://order-service.local/orders`

## 9) Kiểm thử nhanh
PowerShell (Windows):
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/orders" -Method GET
Invoke-WebRequest -Uri "http://localhost:3001/orders" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"productId":"p1","quantity":1}'
```
Bash:
```bash
curl -s http://localhost:3001/orders
curl -s -X POST http://localhost:3001/orders -H 'Content-Type: application/json' -d '{"productId":"p1","quantity":1}'
```

## 10) Tự động scale và cân bằng tải
- Mỗi service có Deployment với `replicas: 2` (khởi đầu). HPA tự động scale theo CPU/Memory (cấu hình trong manifest HPA nếu có).
- Cân bằng tải qua Kubernetes Service. Với `sessionAffinity: ClientIP`, tất cả request từ cùng IP (ví dụ `127.0.0.1`) sẽ đi vào cùng một pod — đây là hành vi đúng. Để thấy phân phối, thử từ IP khác/không dùng affinity qua Ingress.

Một số lệnh hữu ích:
```bash
kubectl get hpa -n <namespace>
kubectl describe hpa <hpa-name> -n <namespace>
kubectl scale deploy/order-service -n <namespace> --replicas=3
kubectl get endpoints order-service -n <namespace> -o wide
```

## 11) Quan sát & Debug
```bash
# Trạng thái
kubectl get pods,svc,deploy,sts,hpa,pdb,ing -A

# Log
a) Theo pod cụ thể
kubectl logs -f deploy/order-service
kubectl logs -f deploy/notification-service
b) Theo pod name
kubectl logs -f <pod-name>

# Mô tả chi tiết tài nguyên
kubectl describe pod/<pod-name>
kubectl describe svc/order-service
```

## 12) Sự cố thường gặp
- Zookeeper/Kafka failed do quyền trên hostPath: Đã chuyển sang StatefulSet + PVC động để tránh lỗi quyền, tăng `initialDelaySeconds` cho probe.
- Notification Service rebalancing liên tục: Đã cấu hình topic có nhiều partition và đặt biến `KAFKA_CONSUMER_GROUP_ID`/`KAFKA_CLIENT_ID` theo `$(HOSTNAME)` để mỗi pod là unique.
- `ErrImagePull`/`ImagePullBackOff`: Đặt `imagePullPolicy: Never` trong Deployment để dùng image local đã build.
- “Tất cả request dồn 1 container”: Do `sessionAffinity: ClientIP`. Đây là mong muốn để giữ phiên. Muốn phân phối đều, dùng Ingress không bật affinity hoặc gửi từ IP khác.
- Ingress không truy cập được port 80: Ở local có thể bị xung đột cổng hoặc controller không expose 80. Dùng `port-forward` cho nhanh, hoặc đổi Service của ingress-nginx sang `NodePort` (nếu hiểu rõ rủi ro) để test.
- NodePort không truy cập từ `localhost`: Cần dùng IP của node (máy host/VM) thay vì `localhost`, hoặc dùng port-forward.

## 13) Cấu trúc thư mục quan trọng
- `backend/k8s/`: Manifest K8s (StatefulSet Kafka/ZK, Deployments, Services, HPA, PDB, Ingress) và script triển khai/dọn dẹp
- `backend/order-service/`: Mã nguồn Order Service (NestJS)
- `backend/notification-service/`: Mã nguồn Notification Service (NestJS)
- `frontend/`: Ứng dụng Next.js (tùy chọn chạy kèm)

## 14) Ghi chú sản xuất (Production)
- Dùng StorageClass/CSI phù hợp (không dùng hostPath) cho Kafka/ZK
- Ingress Controller nên chạy dạng LoadBalancer/IngressClass đúng với cloud provider
- Bật HTTPS/TLS cho Ingress, cấu hình CORS, rate limit và logging
- Theo dõi HPA/PDB/SLO và log/metrics (Prometheus/Grafana/ELK)

Nếu cần, xem thêm chi tiết tại `backend/k8s/README.md`. 