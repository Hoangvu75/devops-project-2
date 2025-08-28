# 🚀 Hướng dẫn Deploy Microservices lên Kubernetes

Hướng dẫn chi tiết deploy hệ thống microservices (NestJS + Kafka + NextJS) lên Kubernetes từ A-Z.

## 📋 Tổng quan

Bạn sẽ deploy hệ thống bao gồm:
- **Zookeeper** (1 replica) - Quản lý Kafka cluster
- **Kafka** (1 replica) - Message broker
- **Order Service** (2 replicas) - API quản lý đơn hàng
- **Notification Service** (2 replicas) - Gửi thông báo
- **Frontend** (2 replicas) - Giao diện NextJS

## 🛠️ Yêu cầu hệ thống

### 1. Cài đặt công cụ:
```bash
# Docker
https://docs.docker.com/get-docker/

# kubectl
https://kubernetes.io/docs/tasks/tools/

# Kubernetes cluster (chọn 1):
# - Minikube (local): https://minikube.sigs.k8s.io/docs/start/
# - Docker Desktop: Enable Kubernetes in settings
# - Cloud: GKE, EKS, AKS
```

### 2. Kiểm tra cài đặt:
```bash
docker --version
kubectl version --client
kubectl cluster-info
```

## 🚀 Cách 1: Deploy tự động (Khuyến nghị)

### Bước 1: Chuẩn bị
```bash
cd k8s
```

### Bước 2: Chạy script deploy
```bash
# Windows PowerShell
.\deploy.sh

# Linux/Mac
./deploy.sh
```

Script sẽ tự động:
1. ✅ Kiểm tra môi trường
2. 🔨 Build Docker images
3. 📦 Deploy từng service theo thứ tự
4. ⏳ Chờ tất cả services ready
5. 📊 Hiển thị thông tin truy cập

### Bước 3: Truy cập ứng dụng
```bash
# Port-forward (dễ nhất)
kubectl port-forward service/frontend 3000:3000 -n microservices
# Truy cập: http://localhost:3000

# Hoặc nếu có Ingress
echo "127.0.0.1 microservices.local" | sudo tee -a /etc/hosts
# Truy cập: http://microservices.local
```

## 🔧 Cách 2: Deploy với Kustomize

```bash
cd k8s
./deploy-kustomize.sh
```

## 📖 Cách 3: Deploy thủ công từng bước

### Bước 1: Build images
```bash
# Order Service
cd order-service
docker build -t order-service:latest .

# Notification Service  
cd ../notification-service
docker build -t notification-service:latest .

# Frontend
cd ../frontend
docker build -t frontend:latest .

cd ../k8s
```

### Bước 2: Deploy infrastructure
```bash
# Tạo namespace
kubectl apply -f namespace.yaml

# Deploy Zookeeper
kubectl apply -f zookeeper.yaml
kubectl wait --for=condition=available --timeout=300s deployment/zookeeper -n microservices

# Deploy Kafka
kubectl apply -f kafka.yaml  
kubectl wait --for=condition=available --timeout=300s deployment/kafka -n microservices
```

### Bước 3: Deploy services
```bash
# Deploy services
kubectl apply -f order-service.yaml
kubectl apply -f notification-service.yaml
kubectl apply -f frontend.yaml

# Chờ services ready
kubectl wait --for=condition=available --timeout=300s deployment --all -n microservices
```

### Bước 4: (Tùy chọn) Deploy Ingress
```bash
kubectl apply -f ingress.yaml
```

## 📊 Kiểm tra deployment

### Xem tất cả resources
```bash
kubectl get all -n microservices
```

### Xem logs
```bash
# Logs từng service
kubectl logs -f deployment/order-service -n microservices
kubectl logs -f deployment/notification-service -n microservices  
kubectl logs -f deployment/frontend -n microservices
kubectl logs -f deployment/kafka -n microservices
```

### Xem chi tiết pods
```bash
kubectl describe pod <pod-name> -n microservices
```

## 🌐 Các cách truy cập ứng dụng

### 1. Port-forward (Dễ nhất)
```bash
kubectl port-forward service/frontend 3000:3000 -n microservices
# Truy cập: http://localhost:3000
```

### 2. LoadBalancer (Cloud providers)
```bash
kubectl get service frontend -n microservices
# Lấy EXTERNAL-IP và truy cập
```

### 3. Minikube
```bash
minikube service frontend -n microservices
```

### 4. Ingress (Chuyên nghiệp)
```bash
# Thêm vào /etc/hosts (Linux/Mac)
echo "127.0.0.1 microservices.local" | sudo tee -a /etc/hosts

# Windows: Thêm vào C:\Windows\System32\drivers\etc\hosts
127.0.0.1 microservices.local

# Truy cập: http://microservices.local
```

## 📈 Scaling

### Scale services
```bash
# Scale order-service lên 5 replicas
kubectl scale deployment order-service --replicas=5 -n microservices

# Scale notification-service lên 3 replicas
kubectl scale deployment notification-service --replicas=3 -n microservices
```

### Auto-scaling với HPA
```bash
# Tạo HPA cho order-service
kubectl autoscale deployment order-service --cpu-percent=70 --min=2 --max=10 -n microservices

# Xem HPA status
kubectl get hpa -n microservices
```

## 🔍 Monitoring và Debug

### Xem events
```bash
kubectl get events -n microservices --sort-by='.lastTimestamp'
```

### Exec vào container
```bash
kubectl exec -it <pod-name> -n microservices -- /bin/bash
```

### Test kết nối Kafka
```bash
kubectl exec -it deployment/kafka -n microservices -- kafka-topics --bootstrap-server localhost:9092 --list
```

### Test API endpoints
```bash
# Test order service
kubectl port-forward service/order-service 3001:3000 -n microservices
curl http://localhost:3001/orders

# Test notification service  
kubectl port-forward service/notification-service 3002:3000 -n microservices
curl http://localhost:3002/notifications
```

## 🧹 Cleanup

### Xóa deployment
```bash
# Sử dụng script
./cleanup.sh

# Hoặc xóa thủ công
kubectl delete namespace microservices
```

### Xóa Docker images
```bash
docker rmi order-service:latest notification-service:latest frontend:latest
```

## 🚨 Troubleshooting

### 1. ImagePullBackOff
```bash
# Kiểm tra images
docker images | grep -E "(order-service|notification-service|frontend)"

# Rebuild nếu cần
docker build -t order-service:latest order-service/
```

### 2. Pods CrashLoopBackOff
```bash
# Xem logs để debug
kubectl logs <pod-name> -n microservices --previous

# Xem describe
kubectl describe pod <pod-name> -n microservices
```

### 3. Services không kết nối
```bash
# Kiểm tra endpoints
kubectl get endpoints -n microservices

# Test DNS resolution
kubectl run debug --image=busybox -it --rm -n microservices -- nslookup order-service
```

### 4. Kafka connection issues
```bash
# Kiểm tra Kafka logs
kubectl logs -f deployment/kafka -n microservices

# Verify Kafka is ready
kubectl exec -it deployment/kafka -n microservices -- kafka-broker-api-versions --bootstrap-server localhost:9092
```

## 🏗️ Kiến trúc Kubernetes

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Namespace: microservices               │   │
│  │                                                     │   │
│  │     ┌─────────────┐    ┌─────────────┐              │   │
│  │     │ Zookeeper   │    │    Kafka    │              │   │
│  │     │(1 replica)  │◄──►│(1 replica)  │              │   │
│  │     └─────────────┘    └─────────────┘              │   │
│  │            │                  │                     │   │
│  │            └──────┬───────────┘                     │   │
│  │                   │ Message Bus                     │   │
│  │     ┌─────────────▼┐    ┌──────────────┐            │   │
│  │     │Order Service││    │Notification  │            │   │
│  │     │(2 replicas) ││    │Service       │            │   │
│  │     │             ││    │(2 replicas)  │            │   │
│  │     └─────────────┬┘    └──────────────┘            │   │
│  │                   │                                 │   │
│  │     ┌─────────────▼┐                                │   │
│  │     │  Frontend   │                                 │   │
│  │     │(2 replicas) │                                 │   │
│  │     └─────────────┘                                 │   │
│  │                                                     │   │
│  │     ┌─────────────┐                                 │   │
│  │     │   Ingress   │ ◄── External Traffic            │   │
│  │     │ Controller  │                                 │   │
│  │     └─────────────┘                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Tài liệu tham khảo

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Commands](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kustomize](https://kustomize.io/)
- [Kafka on Kubernetes](https://kafka.apache.org/documentation/)

## 🎯 Kết luận

Bạn đã thành công deploy hệ thống microservices lên Kubernetes! Hệ thống bao gồm:

✅ **Infrastructure**: Zookeeper + Kafka cluster
✅ **Backend**: Order Service + Notification Service với load balancing
✅ **Frontend**: NextJS app với multiple replicas  
✅ **Networking**: Services, Ingress controller
✅ **Monitoring**: Health checks, resource limits
✅ **Scaling**: Horizontal scaling ready

Hệ thống đã sẵn sàng cho production với khả năng scale, monitor và maintain dễ dàng! 