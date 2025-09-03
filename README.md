# DevOps Project 2

## Overview
Microservices on Kubernetes:
- Order Service (NestJS)
- Notification Service (NestJS)
- Kafka + Zookeeper

## Build Images (local)
```bash
# from project root
# Order Service
docker build -t order-service:latest ./backend/order-service
# Notification Service
docker build -t notification-service:latest ./backend/notification-service
```

## Deploy to Kubernetes
```bash
# from project root
cd backend/k8s
./deploy-with-autoscaling.sh
```

Cleanup:
```bash
cd backend/k8s
./cleanup-with-autoscaling.sh
```

## Access Services (local)
Recommended for local dev (fast and reliable):
```bash
# separate terminals
kubectl port-forward svc/order-service 3001:3001
kubectl port-forward svc/notification-service 3002:3002
```
Then:
- http://localhost:3001/orders
- http://localhost:3002/notifications

## Repo Structure
- `backend/k8s/`: Kubernetes manifests and scripts
- `backend/order-service/`: NestJS Order Service
- `backend/notification-service/`: NestJS Notification Service
- `frontend/`: Next.js app (optional) 
