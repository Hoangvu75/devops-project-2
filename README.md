# DevOps Project 2 — Ops Quickstart

## Overview
Microservices on Kubernetes:
- Order Service (NestJS)
- Notification Service (NestJS)
- Kafka + Zookeeper (StatefulSet with dynamic PVC)

Extras: HPA (autoscaling), load balancing via Service/Ingress, PDB, helper scripts.

## Prerequisites
- Docker Desktop with Kubernetes enabled
- kubectl in PATH
- Bash (WSL/macOS/Linux) or PowerShell

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
What the script does:
- Creates namespace
- Deploys Zookeeper & Kafka as StatefulSets (with PVC)
- Builds and loads local images, sets imagePullPolicy: Never
- Applies Deployments, Services, HPA, PDB, Ingress

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

## Optional: Ingress
Install NGINX Ingress Controller:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
kubectl -n ingress-nginx get pods
```
Add hosts (Windows):
```
C:\Windows\System32\drivers\etc\hosts
127.0.0.1 order-service.local
127.0.0.1 notification-service.local
```
If port 80 is unavailable locally, keep using port-forward for testing.

## Autoscaling & Load Balancing
- Deployments start with 2 replicas; HPA can scale based on resource usage.
- Kubernetes Service balances traffic. With `sessionAffinity: ClientIP`, all requests from the same client IP (e.g. 127.0.0.1) go to the same pod by design.

## Quick Tests
PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/orders" -Method GET
Invoke-WebRequest -Uri "http://localhost:3001/orders" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"productId":"p1","quantity":1}'
```
Bash:
```bash
curl -s http://localhost:3001/orders
curl -s -X POST http://localhost:3001/orders -H 'Content-Type: application/json' -d '{"productId":"p1","quantity":1}'
```

## Troubleshooting (short)
- Zookeeper/Kafka fail on hostPath: fixed by StatefulSet + dynamic PVC.
- ImagePullBackOff: ensure local images exist; manifests use imagePullPolicy: Never.
- All requests hit one pod: due to ClientIP session affinity; expected locally.
- Ingress not reachable: controller not ready or port 80 blocked; use port-forward.

## Repo Structure
- `backend/k8s/`: Kubernetes manifests and scripts
- `backend/order-service/`: NestJS Order Service
- `backend/notification-service/`: NestJS Notification Service
- `frontend/`: Next.js app (optional) 