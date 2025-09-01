# Kubernetes Deployment Guide với Auto Scaling & Load Balancing

Hướng dẫn deploy hệ thống microservices lên Kubernetes với khả năng auto scaling và load balancing.

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Order Service │    │  Kafka/Zookeeper │    │ Notification Service│
│   (Port 3001)   │◄──►│   (Port 9092)    │◄──►│    (Port 3002)     │
│   [2-10 pods]   │    │   [1 broker]     │    │   [2-8 pods]       │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
```

## 📋 Yêu cầu hệ thống

- Kubernetes cluster (minikube, kind, hoặc cloud cluster)
- kubectl CLI tool
- Docker
- Ingress controller (nginx-ingress)
- Metrics server (cho HPA)

## 🚀 Các bước deployment

### 1. Cài đặt Ingress Controller và Metrics Server

```bash
# Với minikube
minikube addons enable ingress
minikube addons enable metrics-server

# Với kind hoặc cluster khác
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 2. Deploy toàn bộ hệ thống với auto scaling

#### Sử dụng bash script (khuyến nghị):
```bash
# Cấp quyền thực thi cho script
chmod +x deploy-with-autoscaling.sh

# Chạy script deployment
./deploy-with-autoscaling.sh
```

#### Sử dụng kustomize:
```bash
kubectl apply -k .
```

#### Deploy từng bước:
```bash
# Deploy Kafka và Zookeeper
kubectl apply -f kafka-statefulset.yaml

# Deploy Order Service với auto scaling
kubectl apply -f order-service-deployment.yaml

# Deploy Notification Service với auto scaling
kubectl apply -f notification-service-deployment.yaml

# Deploy Pod Disruption Budget
kubectl apply -f pod-disruption-budget.yaml

# Deploy Ingress với load balancing
kubectl apply -f ingress.yaml
```

### 3. Kiểm tra trạng thái

```bash
# Xem tất cả pods
kubectl get pods -n microservices

# Xem services
kubectl get services -n microservices

# Xem ingress
kubectl get ingress -n microservices

# Xem Horizontal Pod Autoscalers
kubectl get hpa -n microservices

# Xem Pod Disruption Budgets
kubectl get pdb -n microservices
```

## 🔧 Khắc phục lỗi thường gặp

### Lỗi Permission với PersistentVolume
**Vấn đề**: Container không thể ghi vào data directory
**Nguyên nhân**: hostPath volume trên Windows có vấn đề permission
**Giải pháp**: Sử dụng StatefulSet với volumeClaimTemplates (đã được áp dụng)

### Lỗi Health Check phức tạp
**Vấn đề**: Zookeeper/Kafka bị crash do health check quá phức tạp
**Nguyên nhân**: exec command với netcat không hoạt động đúng
**Giải pháp**: Sử dụng tcpSocket health check đơn giản hơn

### Lỗi Kết nối Kafka-Zookeeper
**Vấn đề**: Kafka không thể kết nối với Zookeeper
**Nguyên nhân**: Zookeeper chưa sẵn sàng khi Kafka khởi động
**Giải pháp**: Deploy tuần tự và tăng timeout

### Lỗi Notification Service Consumer Group Rebalancing
**Vấn đề**: Notification service bị fail do consumer group rebalancing
**Nguyên nhân**: Nhiều instance cùng tham gia vào một consumer group
**Giải pháp**: 
- Sử dụng unique consumer group ID cho mỗi pod
- Tăng số partition cho Kafka topics
- Cải thiện session management

### Lỗi Metrics Server không hoạt động
**Vấn đề**: HPA không thể lấy metrics
**Nguyên nhân**: Metrics server chưa được cài đặt hoặc không hoạt động
**Giải pháp**: 
```bash
# Kiểm tra metrics server
kubectl get pods -n kube-system | grep metrics-server

# Cài đặt metrics server
minikube addons enable metrics-server
```

### Khắc phục Notification Service
```bash
# Chạy script khắc phục
./fix-notification-service.sh
```

### Test kết nối Kafka
```bash
# Chạy script test
./test-load-balancing.sh

# Hoặc test thủ công
kubectl run kafka-test --image=confluentinc/cp-kafka:7.4.0 --rm -it --restart=Never -n microservices -- bash -c "
kafka-topics --bootstrap-server kafka-service:9092 --list
"
```

## 🧪 Test hệ thống

### Test load balancing
```bash
# Chạy script test load balancing
chmod +x test-load-balancing.sh
./test-load-balancing.sh
```

### Tạo đơn hàng mới
```bash
curl -X POST http://localhost:3001/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "customerName": "Nguyễn Văn A",
    "customerEmail": "nguyenvana@example.com",
    "totalAmount": 150000,
    "products": [
      {
        "name": "Sản phẩm 1",
        "price": 100000
      },
      {
        "name": "Sản phẩm 2", 
        "price": 50000
      }
    ]
  }'
```

### Xem danh sách đơn hàng
```bash
curl http://localhost:3001/orders
```

### Xác nhận đơn hàng
```bash
# Thay ORDER_ID bằng ID thực tế
curl -X PUT http://localhost:3001/orders/ORDER_ID/confirm
```

### Xem thông báo
```bash
curl http://localhost:3002/notifications
```

## 🔧 Troubleshooting

### Kiểm tra logs
```bash
# Zookeeper logs
kubectl logs -f statefulset/zookeeper -n microservices

# Kafka logs
kubectl logs -f statefulset/kafka -n microservices

# Order Service logs
kubectl logs -f deployment/order-service-deployment -n microservices

# Notification Service logs  
kubectl logs -f deployment/notification-service-deployment -n microservices
```

### Kiểm tra auto scaling
```bash
# Xem HPA status
kubectl describe hpa order-service-hpa -n microservices
kubectl describe hpa notification-service-hpa -n microservices

# Xem metrics
kubectl top pods -n microservices

# Test scaling thủ công
kubectl scale deployment order-service-deployment --replicas=5 -n microservices
```

### Kiểm tra kết nối Kafka
```bash
# Vào pod Kafka
kubectl exec -it statefulset/kafka -n microservices -- /bin/bash

# Test producer
kafka-console-producer --bootstrap-server localhost:9092 --topic test-topic

# Test consumer
kafka-console-consumer --bootstrap-server localhost:9092 --topic test-topic --from-beginning
```

### Restart service
```bash
kubectl rollout restart statefulset/zookeeper -n microservices
kubectl rollout restart statefulset/kafka -n microservices
kubectl rollout restart deployment/order-service-deployment -n microservices
kubectl rollout restart deployment/notification-service-deployment -n microservices
```

## 🧹 Cleanup

Để xóa toàn bộ deployment:

```bash
chmod +x cleanup-with-autoscaling.sh
./cleanup-with-autoscaling.sh
```

## 📊 Monitoring và Auto Scaling

### Horizontal Pod Autoscaler (HPA)
- **Order Service**: 2-10 replicas, CPU 70%, Memory 80%
- **Notification Service**: 2-8 replicas, CPU 70%, Memory 80%

### Load Balancing
- **Round Robin**: Phân phối request đều giữa các pods
- **Session Affinity**: Duy trì session cho cùng một client
- **Upstream Hash**: Phân phối dựa trên IP của client

### Pod Disruption Budget
- **minAvailable: 1**: Luôn có ít nhất 1 pod available
- **Đảm bảo availability** khi rolling update hoặc node maintenance

## 🔒 Security Notes

- Các service đang chạy với quyền mặc định
- Không có authentication/authorization
- Chỉ sử dụng cho development/testing
- Với production, cần thêm:
  - Network policies
  - RBAC
  - Secrets management
  - TLS/SSL
  - Service mesh (Istio/Linkerd)

## 📝 Notes

- **StatefulSet**: Sử dụng StatefulSet cho Kafka và Zookeeper để quản lý state tốt hơn
- **Volume Management**: Sử dụng volumeClaimTemplates thay vì hostPath để tránh lỗi permission
- **Health Checks**: Sử dụng tcpSocket health check đơn giản thay vì exec command phức tạp
- **Deployment Order**: Deploy Zookeeper trước, sau đó mới deploy Kafka
- **Auto Scaling**: HPA tự động scale dựa trên CPU và Memory usage
- **Load Balancing**: Ingress controller phân phối traffic giữa các pods
- **Session Management**: Unique consumer group ID cho mỗi notification service pod
- **Kafka Partitions**: 3 partitions để hỗ trợ nhiều consumer
- **Scaling**: Có thể scale từ 2-10 replicas cho order service, 2-8 cho notification service
- **Windows Compatibility**: Đã được tối ưu để chạy trên Windows với Docker Desktop

## 🆕 Cải tiến mới

- ✅ Auto Scaling với Horizontal Pod Autoscaler (HPA)
- ✅ Load Balancing với Ingress controller
- ✅ Session Affinity và Session Management
- ✅ Pod Disruption Budget để đảm bảo availability
- ✅ Kafka topics với nhiều partitions
- ✅ Unique consumer group ID cho mỗi pod
- ✅ Round Robin load balancing
- ✅ Metrics-based scaling (CPU 70%, Memory 80%)
- ✅ Stabilization windows cho scaling policies
- ✅ Scripts bash cho Linux/Mac
- ✅ Cải thiện resource allocation và monitoring

## 🚨 Lưu ý quan trọng

1. **Deploy tuần tự**: Zookeeper phải khởi động hoàn toàn trước khi deploy Kafka
2. **Health Check đơn giản**: Sử dụng tcpSocket thay vì exec command
3. **Timeout phù hợp**: Tăng timeout cho Kafka để đợi Zookeeper sẵn sàng
4. **Test từng bước**: Sử dụng script test để kiểm tra kết nối
5. **Auto Scaling**: Cần metrics server để HPA hoạt động
6. **Load Balancing**: Ingress controller cần được cài đặt
7. **Kafka Partitions**: Tăng số partition để hỗ trợ nhiều consumer
8. **Consumer Groups**: Unique ID cho mỗi pod để tránh rebalancing

## 🚨 Vấn đề đã khắc phục

### Notification Service Consumer Group Rebalancing
- **Vấn đề**: Nhiều instance cùng tham gia consumer group gây rebalancing liên tục
- **Giải pháp**: Unique consumer group ID, tăng partitions, cải thiện session management
- **Kết quả**: Service hoạt động ổn định, hỗ trợ nhiều instance

### Auto Scaling và Load Balancing
- **Vấn đề**: Không có khả năng scale tự động và phân phối traffic
- **Giải pháp**: HPA, Ingress load balancing, Pod Disruption Budget
- **Kết quả**: Hệ thống có thể scale từ 2-10 replicas, load balancing tự động 