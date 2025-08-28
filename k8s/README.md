# Deploy Microservices lên Kubernetes

Hướng dẫn deploy hệ thống microservices (NestJS + Kafka + NextJS) lên Kubernetes.

## Yêu cầu hệ thống

### 1. Cài đặt các công cụ cần thiết:
- **Docker**: [Tải về tại đây](https://docs.docker.com/get-docker/)
- **kubectl**: [Hướng dẫn cài đặt](https://kubernetes.io/docs/tasks/tools/)
- **Kubernetes cluster**: Một trong các tùy chọn sau:
  - **Minikube** (local): [Hướng dẫn cài đặt](https://minikube.sigs.k8s.io/docs/start/)
  - **Docker Desktop** (local): Bật Kubernetes trong settings
  - **Cloud providers**: GKE, EKS, AKS

### 2. Kiểm tra cài đặt:
```bash
docker --version
kubectl version --client
kubectl cluster-info
```

## Cách deploy nhanh

### Bước 1: Chuẩn bị
```bash
# Di chuyển vào thư mục k8s
cd k8s

# Cấp quyền thực thi cho scripts
chmod +x deploy.sh cleanup.sh
```

### Bước 2: Deploy
```bash
# Chạy script deploy tự động
./deploy.sh
```

Script sẽ tự động:
1. ✅ Kiểm tra môi trường (Docker, kubectl, k8s cluster)
2. 🔨 Build Docker images cho 3 services
3. 📦 Deploy lên Kubernetes theo thứ tự: Zookeeper → Kafka → Services
4. ⏳ Chờ tất cả services ready
5. 📊 Hiển thị thông tin services

### Bước 3: Truy cập ứng dụng

#### Tùy chọn 1: LoadBalancer (Cloud providers)
```bash
# Xem IP external
kubectl get service frontend -n microservices
# Truy cập: http://EXTERNAL-IP:3000
```

#### Tùy chọn 2: Minikube
```bash
minikube service frontend -n microservices
```

#### Tùy chọn 3: Port-forward (Local)
```bash
kubectl port-forward service/frontend 3000:3000 -n microservices
# Truy cập: http://localhost:3000
```

## Deploy thủ công từng bước

### Bước 1: Build Docker images
```bash
# Build order-service
cd ../order-service
docker build -t order-service:latest .

# Build notification-service
cd ../notification-service
docker build -t notification-service:latest .

# Build frontend
cd ../frontend
docker build -t frontend:latest .

cd ../k8s
```

### Bước 2: Deploy lên Kubernetes
```bash
# Tạo namespace
kubectl apply -f namespace.yaml

# Deploy Zookeeper
kubectl apply -f zookeeper.yaml

# Chờ Zookeeper ready
kubectl wait --for=condition=available --timeout=300s deployment/zookeeper -n microservices

# Deploy Kafka
kubectl apply -f kafka.yaml

# Chờ Kafka ready
kubectl wait --for=condition=available --timeout=300s deployment/kafka -n microservices

# Deploy services
kubectl apply -f order-service.yaml
kubectl apply -f notification-service.yaml
kubectl apply -f frontend.yaml
```

### Bước 3: Kiểm tra deployment
```bash
# Xem tất cả pods
kubectl get pods -n microservices

# Xem services
kubectl get services -n microservices

# Xem chi tiết deployment
kubectl describe deployment order-service -n microservices
```

## Monitoring và Debug

### Xem logs
```bash
# Logs của từng service
kubectl logs -f deployment/order-service -n microservices
kubectl logs -f deployment/notification-service -n microservices
kubectl logs -f deployment/frontend -n microservices
kubectl logs -f deployment/kafka -n microservices
```

### Kiểm tra trạng thái
```bash
# Xem tất cả resources
kubectl get all -n microservices

# Xem events
kubectl get events -n microservices --sort-by='.lastTimestamp'

# Describe pod để debug
kubectl describe pod <pod-name> -n microservices
```

### Exec vào container
```bash
# Vào container để debug
kubectl exec -it <pod-name> -n microservices -- /bin/bash

# Test kết nối Kafka
kubectl exec -it <kafka-pod> -n microservices -- kafka-topics --bootstrap-server localhost:9092 --list
```

## Scaling

### Scale services
```bash
# Scale order-service lên 3 replicas
kubectl scale deployment order-service --replicas=3 -n microservices

# Scale notification-service lên 5 replicas
kubectl scale deployment notification-service --replicas=5 -n microservices
```

### Horizontal Pod Autoscaler (HPA)
```bash
# Tạo HPA cho order-service
kubectl autoscale deployment order-service --cpu-percent=70 --min=2 --max=10 -n microservices

# Xem HPA status
kubectl get hpa -n microservices
```

## Cleanup

### Xóa deployment
```bash
# Sử dụng script cleanup
./cleanup.sh

# Hoặc xóa thủ công
kubectl delete namespace microservices
```

### Xóa Docker images
```bash
docker rmi order-service:latest notification-service:latest frontend:latest
```

## Troubleshooting

### Lỗi thường gặp:

#### 1. ImagePullBackOff
```bash
# Kiểm tra image có tồn tại không
docker images | grep -E "(order-service|notification-service|frontend)"

# Rebuild image nếu cần
docker build -t order-service:latest ../order-service/
```

#### 2. Pods không start
```bash
# Xem logs chi tiết
kubectl logs <pod-name> -n microservices

# Xem describe để biết lỗi
kubectl describe pod <pod-name> -n microservices
```

#### 3. Services không kết nối được
```bash
# Kiểm tra endpoints
kubectl get endpoints -n microservices

# Test kết nối từ bên trong cluster
kubectl run test-pod --image=busybox -it --rm -n microservices -- sh
# Trong pod: wget -qO- http://order-service:3000/orders
```

#### 4. Kafka connection issues
```bash
# Kiểm tra Kafka logs
kubectl logs -f deployment/kafka -n microservices

# Kiểm tra Kafka topics
kubectl exec -it deployment/kafka -n microservices -- kafka-topics --bootstrap-server localhost:9092 --list
```

## Cấu hình nâng cao

### Persistent Volumes cho Kafka
Để data không bị mất khi restart, thêm PersistentVolume:

```yaml
# Thêm vào kafka.yaml
volumeMounts:
- name: kafka-storage
  mountPath: /var/lib/kafka/data
volumes:
- name: kafka-storage
  persistentVolumeClaim:
    claimName: kafka-pvc
```

### ConfigMaps cho cấu hình
Tách environment variables ra ConfigMap:

```bash
kubectl create configmap app-config \
  --from-literal=KAFKA_BROKERS=kafka:29092 \
  --from-literal=ORDER_SERVICE_URL=http://order-service:3000 \
  -n microservices
```

### Secrets cho thông tin nhạy cảm
```bash
kubectl create secret generic app-secrets \
  --from-literal=database-password=secret123 \
  -n microservices
```

## Kiến trúc Kubernetes

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Namespace: microservices               │   │
│  │                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ Zookeeper   │  │    Kafka    │  │   Frontend  │  │   │
│  │  │ (1 replica) │  │ (1 replica) │  │ (2 replicas)│  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  │                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │Order Service│  │Notification │                   │   │
│  │  │(2 replicas) │  │Service      │                   │   │
│  │  │             │  │(2 replicas) │                   │   │
│  │  └─────────────┘  └─────────────┘                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Tài liệu tham khảo
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kafka on Kubernetes](https://kafka.apache.org/documentation/#quickstart) 